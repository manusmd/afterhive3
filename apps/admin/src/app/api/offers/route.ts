import { NextResponse } from "next/server";
import { getAdminSessionContext } from "@afterhive/api/auth/get-admin-session";
import { canCreateOffer } from "@afterhive/api/offer/can-create-offer";
import { canReadOffers } from "@afterhive/api/offer/can-read-offers";
import { CreateOfferError, createOffer } from "@afterhive/api/offer/create-offer";
import { listOffers } from "@afterhive/api/offer/list-offers";

export async function GET(request: Request) {
  const tenantSlug = request.headers.get("x-tenant-slug");

  if (!tenantSlug) {
    return NextResponse.json({ error: "missing_tenant" }, { status: 400 });
  }

  const session = await getAdminSessionContext(tenantSlug, request.headers);

  if (!session || !canReadOffers(session.roles, session.locationIds)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const items = await listOffers(session, tenantSlug);
  return NextResponse.json({ items });
}

type CreateOfferBody = {
  name?: string;
  description?: string;
  type?: "team" | "course" | "workshop" | "subscription";
  locationId?: string;
  groupName?: string;
  capacity?: number;
  recurrence?: {
    dtstart?: string;
    durationMinutes?: number;
    rrule?: string;
    timezone?: string;
    generateWeeks?: number;
  };
};

export async function POST(request: Request) {
  const tenantSlug = request.headers.get("x-tenant-slug");

  if (!tenantSlug) {
    return NextResponse.json({ error: "missing_tenant" }, { status: 400 });
  }

  const session = await getAdminSessionContext(tenantSlug, request.headers);

  if (!session) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  if (!canCreateOffer(session.roles, session.locationIds, session.roleAssignments)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  let body: CreateOfferBody;

  try {
    body = (await request.json()) as CreateOfferBody;
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  if (
    typeof body.name !== "string" ||
    typeof body.locationId !== "string" ||
    typeof body.groupName !== "string" ||
    typeof body.type !== "string" ||
    typeof body.capacity !== "number" ||
    !body.recurrence ||
    typeof body.recurrence.dtstart !== "string" ||
    typeof body.recurrence.durationMinutes !== "number" ||
    typeof body.recurrence.rrule !== "string" ||
    typeof body.recurrence.timezone !== "string" ||
    typeof body.recurrence.generateWeeks !== "number"
  ) {
    return NextResponse.json({ error: "missing_fields" }, { status: 400 });
  }

  try {
    const result = await createOffer(session, tenantSlug, {
      name: body.name,
      description: body.description,
      type: body.type,
      locationId: body.locationId,
      groupName: body.groupName,
      capacity: body.capacity,
      recurrence: {
        dtstart: body.recurrence.dtstart,
        durationMinutes: body.recurrence.durationMinutes,
        rrule: body.recurrence.rrule,
        timezone: body.recurrence.timezone,
        generateWeeks: body.recurrence.generateWeeks,
      },
    });
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    if (error instanceof CreateOfferError) {
      const status =
        error.code === "tenant_not_found"
          ? 404
          : error.code === "location_forbidden" || error.code === "forbidden"
            ? 403
            : 400;
      return NextResponse.json({ error: error.code }, { status });
    }

    throw error;
  }
}
