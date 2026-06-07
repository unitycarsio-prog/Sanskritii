# Security Specification

## Data Invariants
1. Products: Readable by everyone. Writable only by me (as the owner/admin).
2. Users: Profile information is only readable/writable by the owner.
3. Orders: Created by authenticated users. Readable only by the owner. Writable status updates only by owner or admin.

## The "Dirty Dozen" Payloads (Examples)
1. { "Product": { "name": "Hack", "price": -100 } } (Invalid price)
2. { "Product": { "name": "...", "price": "cheap" } } (Invalid price type)
3. { "Order": { "userId": "someone_else_uid", "total": 10 } } (Spoofing userId)
4. { "Order": { "status": "completed", "total": 0 } } (Manipulating status without admin)
... (etc)

## Test Runner (firestore.rules.test.ts)
(To be implemented in the testing framework)
