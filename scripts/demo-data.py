#!/usr/bin/env python3
"""
Fill the CRM with plausible demo data, or wipe it.

    python3 scripts/demo-data.py seed
    python3 scripts/demo-data.py wipe

Useful for seeing the dashboard with something in it, or for training a new rep
before real leads arrive.

⚠️ It writes to the LIVE project. `wipe` deletes every lead, customer, enrollment,
payment, follow-up and cohort — everything except the programmes, the roles and
the team. Do not run `wipe` once real parents are in there.
"""
import datetime as dt
import json
import random
import subprocess
import sys

REF = "zjbjhrbpvgnxcvawybtt"
URL = f"https://{REF}.supabase.co"


def service_key() -> str:
    out = subprocess.run(
        ["supabase", "projects", "api-keys", "--project-ref", REF],
        capture_output=True, text=True).stdout
    for line in out.splitlines():
        if "service_role" in line:
            return line.split()[2]
    sys.exit("Could not read the service_role key. Run: supabase login")


KEY = service_key()
HDR = ["-H", f"apikey: {KEY}", "-H", f"Authorization: Bearer {KEY}",
       "-H", "Content-Type: application/json"]


def call(method, path, body=None, rep=False):
    cmd = ["curl", "-s", *HDR, "-X", method, f"{URL}/rest/v1/{path}"]
    if rep:
        cmd += ["-H", "Prefer: return=representation"]
    if body is not None:
        cmd += ["-d", json.dumps(body)]
    out = subprocess.run(cmd, capture_output=True, text=True).stdout
    try:
        return json.loads(out) if out.strip() else None
    except json.JSONDecodeError:
        return out


def wipe():
    # Order matters: the foreign keys are ON DELETE RESTRICT on purpose.
    for t in ["payments", "follow_ups", "enrollments", "customers", "leads", "cohorts"]:
        call("DELETE", f"{t}?id=not.is.null")
        print(f"  cleared {t}")


def seed():
    progs = {p["slug"]: p for p in call("GET", "programs?select=id,slug,title")}
    team_rows = call("GET", "team_members?select=id")
    team = team_rows[0]["id"] if team_rows else None
    today = dt.date.today()
    random.seed(7)
    now = dt.datetime.now(dt.timezone.utc)

    cohorts = []
    for slug, name, days, seats in [
        ("ages-10-13", "October · Ages 10–13", 11, 12),
        ("ages-5-9",   "October · Ages 5–9",   25, 12),
        ("ages-14-17", "September · Ages 14–17", -6, 10),
    ]:
        cohorts.append(call("POST", "cohorts", {
            "program_id": progs[slug]["id"], "name": name,
            "starts_on": str(today + dt.timedelta(days=days)),
            "seats_total": seats, "status": "running" if days < 0 else "upcoming",
            "instructor": "Dr. Walaa Elgammal", "weekday": 6, "start_time": "17:00",
        }, rep=True)[0])

    sources = ["facebook", "instagram", "website", "referral", "tiktok"]
    statuses = ["new"] * 3 + ["contacted"] * 2 + ["qualified", "trial_booked"] + ["won"] * 2 + ["lost"]
    leads = []
    for i in range(26):
        created = now - dt.timedelta(days=random.randint(0, 44), hours=random.randint(0, 20))
        status = random.choice(statuses)
        leads.append(call("POST", "leads", {
            "parent_name": f"Parent {i + 1}",
            "phone": f"010{random.randint(10_000_000, 99_999_999)}",
            "child_age": random.choice([6, 7, 8, 9, 11, 12, 13, 15, 16]),
            "status": status, "source": "website", "utm_source": random.choice(sources),
            "created_at": created.isoformat(),
            "last_contacted_at": None if status == "new"
                else (created + dt.timedelta(days=random.randint(0, 3))).isoformat(),
            "assigned_to": team if random.random() > 0.35 else None,
        }, rep=True)[0])

    won = [l for l in leads if l["status"] == "won"]
    for i, l in enumerate(won):
        cust = call("POST", "customers", {
            "name": l["parent_name"], "phone": l["phone"], "lead_id": l["id"]}, rep=True)[0]
        age = l["child_age"] or 0
        cohort = cohorts[0] if 10 <= age <= 13 else (cohorts[1] if age < 10 else cohorts[2])
        paid = i % 4 != 0   # one in four left reserved-but-unpaid, so the leak chip has something
        enr = call("POST", "enrollments", {
            "customer_id": cust["id"], "cohort_id": cohort["id"],
            "child_name": f"Child of {l['parent_name']}", "child_age": age,
            "amount_egp": 3000, "status": "paid" if paid else "reserved",
            "sold_by": team, "created_at": l["created_at"]}, rep=True)[0]
        call("POST", "payments", {
            "enrollment_id": enr["id"], "amount_egp": 3000,
            "status": "paid" if paid else "pending",
            "paid_at": l["created_at"] if paid else None})

    for l in leads[:6]:
        call("POST", "follow_ups", {
            "lead_id": l["id"],
            "scheduled_date": str(today + dt.timedelta(days=random.choice([-3, -1, 0, 0, 2, 4]))),
            "status": "pending", "owner_id": team,
            "notes": "Call back about the October group."})

    print(f"  seeded {len(leads)} leads, {len(won)} won, {len(cohorts)} cohorts")


if __name__ == "__main__":
    cmd = sys.argv[1] if len(sys.argv) > 1 else ""
    if cmd == "seed":
        seed()
    elif cmd == "wipe":
        wipe()
    else:
        sys.exit(__doc__)
