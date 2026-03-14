# Work Machine Override backend resource

Included files:
- `entities/work-machine-override.entity.ts`
- `entities/work-machine-override-type.entity.ts`
- `dto/create-work-machine-override.dto.ts`
- `dto/update-work-machine-override.dto.ts`
- `dto/create-work-machine-override-type.dto.ts`
- `dto/update-work-machine-override-type.dto.ts`
- `work-machine-override.controller.ts`
- `work-machine-override.service.ts`
- `work-machine-override.module.ts`

## Routes

### Overrides
- `POST /work-machine-overrides`
- `GET /work-machine-overrides`
- `GET /work-machine-overrides/:id`
- `PATCH /work-machine-overrides/:id`
- `DELETE /work-machine-overrides/:id`

### Types
- `POST /work-machine-overrides/types`
- `GET /work-machine-overrides/types/all`
- `GET /work-machine-overrides/types/:id`
- `PATCH /work-machine-overrides/types/:id`
- `DELETE /work-machine-overrides/types/:id`

## Notes
- Temporal engine fields use `BIGINT` in milliseconds: `dtstart_utc_ms`, `duration_ms`.
- Audit fields use `DATETIME(6)`: `created_at`, `updated_at`.
- `timezone` is stored explicitly for recurrence correctness.
- `rrule = null` means one-shot override.
