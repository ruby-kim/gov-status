class StatsBuilder:
    @staticmethod
    def build(results):
        overall = {"total": 0, "normal": 0, "maintenance": 0, "problem": 0}
        per_agency = {}

        for r in results:
            aid, st = r["agencyId"], r["status"]
            if aid not in per_agency:
                per_agency[aid] = {"total": 0, "normal": 0, "maintenance": 0, "problem": 0}

            per_agency[aid][st] += 1
            per_agency[aid]["total"] += 1

            overall[st] += 1
            overall["total"] += 1

        return {"overall": overall, "perAgency": per_agency}
