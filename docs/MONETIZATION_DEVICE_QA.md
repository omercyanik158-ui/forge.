# FORGE Monetization Device QA

This checklist is the release-side QA output for monetization. Each item must end in one of these statuses:

- `passed`
- `retest`
- `blocked`

Current repository status: `blocked` until production keys, store products, and test builds are ready.

## 1. iOS dev build

| Flow | Status | Notes |
| --- | --- | --- |
| Fresh install | blocked | Dev build validation still required on device |
| Free meal quota -> limit modal | blocked | Needs device run |
| Free physique quota -> limit modal | blocked | Needs device run |
| Premium CTA shown first | blocked | Needs device run |
| Rewarded CTA shown only when eligible | blocked | Needs device run |
| Completed ad grants exactly +1 correct credit type | blocked | Needs device run |
| Credit is consumed exactly once | blocked | Needs device run |
| Premium user never sees rewarded ad prompt | blocked | Needs premium test account |
| Restore purchase after reinstall | blocked | Needs sandbox purchase |

## 2. Android dev build

| Flow | Status | Notes |
| --- | --- | --- |
| Fresh install | blocked | Dev build validation still required on device |
| Rewarded ad load/show/close | blocked | Needs native AdMob test build |
| Offline during ad | blocked | Needs device run |
| Background during ad | blocked | Needs device run |
| Purchase and restore | blocked | Needs Play test product |
| AI quota blocked before provider call | blocked | Needs backend log verification |

## 3. TestFlight

| Flow | Status | Notes |
| --- | --- | --- |
| Monthly sandbox purchase | blocked | Waiting for App Store Connect product |
| Annual sandbox purchase | blocked | Waiting for App Store Connect product |
| Cancelled purchase path | blocked | Needs sandbox run |
| Restore after reinstall | blocked | Needs sandbox run |
| Premium persistence after restart | blocked | Needs sandbox run |

## 4. Google Play internal test

| Flow | Status | Notes |
| --- | --- | --- |
| Purchase | blocked | Waiting for Play product |
| Restore or reopen | blocked | Needs internal test build |
| Premium persistence | blocked | Needs internal test build |

## 5. Failure scenarios

| Scenario | Status | Notes |
| --- | --- | --- |
| Skipped ad grants nothing | blocked | Needs device run |
| Ad load failure grants nothing | blocked | Needs device run |
| No fill grants nothing | blocked | Needs device run |
| RevenueCat unavailable | blocked | Needs network fault test |
| Upstash unavailable | blocked | Needs backend fault test |
| App kill after ad before analysis | blocked | Needs lifecycle test |
| Duplicate taps do not double-consume credit | blocked | Needs device and backend log test |
