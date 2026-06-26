# Portal Permission Matrix

## Purpose

Portal role permissions.

## Scope

MVP self-service + chat

| Resource / Action | parent | adult_member | self_payer |
|-------------------|--------|--------------|------------|
| dashboard.read | Y | Y | Y |
| person.read_self | Y | Y | Y |
| person.read_children | Y | - | - |
| person.update_self | Y | Y | Y |
| person.update_children | Y | - | - |
| enrollment.read | Y* | Y | - |
| session.read | Y* | Y | - |
| invoice.read | Y** | Y | Y** |
| document.read | Y* | Y | - |
| thread.read | Y | Y | Y |
| thread.write | Y | Y | Y |
| request.submit | Y | Y | Y |
| consent.grant | Y | - | - |

*linked minors only  
**household invoices for parent; own for payer link

## Deny

- No CRM, no other persons, no admin billing actions
