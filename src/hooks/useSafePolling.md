# useSafePolling

A custom hook that polls an RTK Query `refetch` function on a fixed interval, but skips a tick if the previous request is still in-flight. This prevents request pile-up when the network is slow or the server is busy.

## Hook signature

```js
useSafePolling(refetch, isFetching, intervalMs?)
```

| Argument | Type | Description |
|---|---|---|
| `refetch` | `function` | The `refetch` function returned by any RTK Query hook |
| `isFetching` | `boolean` | The `isFetching` flag from the same RTK Query hook |
| `intervalMs` | `number` | How often to poll in milliseconds. Defaults to `POLL_INTERVAL_MS` |

## Polling tiers

Three constants control polling speed across the entire app. Changing a constant here updates every file that uses it — you never need to touch individual components.

### Tier 1 — Real-time (`POLL_INTERVAL_MS = 5000`)

Default. Used for data that must stay live: sensor readings, active alerts, device status, notifications.

```js
// No third argument needed — picks up POLL_INTERVAL_MS automatically
useSafePolling(refetch, sensorFetching)
```

To change the real-time interval across the whole app, update this one constant.

### Tier 2 — Slow (`POLL_INTERVAL_SLOW_MS = 120_000`)

Used for data that changes infrequently: reports, user lists, contact messages, alert statistics. Polls every 2 minutes instead of every 5 seconds — reduces ~96% of requests for these endpoints.

```js
useSafePolling(refetch, reportsFetching, POLL_INTERVAL_SLOW_MS)
```

### Tier 3 — Never (`POLL_INTERVAL_NEVER = 0`)

Disables background polling entirely. Data is fetched once when the component mounts and never re-fetched in the background. Used for static/config data: blog posts, notification preferences, interval presets.

```js
useSafePolling(refetch, blogsFetching, POLL_INTERVAL_NEVER)
```

Passing `0` causes the hook to skip creating a `setInterval` altogether — no timer overhead at all.

> Keeping the call (rather than removing it) means the pattern is uniform across every file. To enable polling on a Tier 3 endpoint later, swap `POLL_INTERVAL_NEVER` for `POLL_INTERVAL_SLOW_MS` on that one line.

## Files by tier

| Tier | Constant | Files |
|---|---|---|
| 1 | `POLL_INTERVAL_MS` | `Overview.jsx`, `Sensors.jsx`, `Analytics.jsx` (sensor + alerts), `Alerts.jsx` (list), `ControlPanel.jsx` (device status), `Notifications.jsx`, `Dashboard.jsx` |
| 2 | `POLL_INTERVAL_SLOW_MS` | `Reports.jsx`, `Analytics.jsx` (alert stats), `Alerts.jsx` (single view), `UserManagement.jsx`, `ContactMessages.jsx` |
| 3 | `POLL_INTERVAL_NEVER` | `Settings.jsx`, `ControlPanel.jsx` (presets), `BlogManagement.jsx`, `Blog.jsx`, `BlogPost.jsx` |

## How the skip-if-in-flight guard works

```js
const isFetchingRef = useRef(isFetching);

useEffect(() => {
  isFetchingRef.current = isFetching; // always holds latest value
}, [isFetching]);

useEffect(() => {
  if (!intervalMs) return; // POLL_INTERVAL_NEVER — no timer created

  const id = setInterval(() => {
    if (!isFetchingRef.current) refetch(); // skip tick if previous request is still running
  }, intervalMs);

  return () => clearInterval(id);
}, [refetch, intervalMs]);
```

A `useRef` is used instead of reading `isFetching` directly inside `setInterval` because the interval callback captures a stale closure — `useRef` always gives the latest value without needing to re-create the interval.

## UI loading behaviour

- Use `isLoading` (not `isFetching`) to show skeletons or spinners. `isLoading` is only `true` on the very first fetch when there is no data yet.
- `isFetching` is `true` on every poll tick — using it for UI would cause a spinner flash every 5 seconds.

```js
// Correct — skeleton shows only on first load
if (isLoading) return <Skeleton />;

// Wrong — skeleton re-appears on every background poll
if (isFetching) return <Skeleton />;
```
