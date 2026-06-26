# GDPR Processes

## Purpose

Data subject rights workflows.

## Right of access

- Portal: SCR-portal-privacy request button
- Staff: PROC-gdpr.exportPerson → JOB-gdpr-export → zip within 30 days SLA

## Rectification

- Portal profile edit PROC-portal.updateProfile
- Staff person edit

## Erasure

- PROC-gdpr.anonymizePerson: replace name/email/phone with placeholders; retain invoices
- Block if legal retention conflict → partial anonymization + note

## Consent withdrawal

- Update ENT-ConsentRecord granted=false; stop marketing jobs

## Processor role

Afterhive DPA with tenants; subprocessors list in platform settings

## Flow

[07-flows/13-data-subject-export-delete.md](../07-flows/13-data-subject-export-delete.md)
