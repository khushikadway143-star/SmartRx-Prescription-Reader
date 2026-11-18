/** Local dose alarms. */
import PushNotification from 'react-native-push-notification';
import { vibrate } from '../accessibility';
import type { Dose, HapticKind } from '../types';

/**
 * Reliable silent-mode bypass is a platform privilege, not a flag:
 *  - iOS needs Apple's Critical Alerts entitlement (apply to Apple) plus user consent.
 *  - Android needs an alarm-category channel, exact-alarm and full-screen-intent permissions,
 *    and the user allowing "override Do Not Disturb". Consider Notifee for these APIs.
 */
export function setupNotifications(onTap: (doseId: string) => void) {
  PushNotification.configure({
    requestPermissions: true,
    onNotification: (n: any) => {
      const kind = n.userInfo?.kind as HapticKind | undefined;
      // Alarm fired while the app is running: play the pattern the patient chose for this slot.
      // When the app is closed, Android uses the notification channel's fixed vibration instead;
      // for per-pattern vibration in the background create one channel per pattern (Notifee supports this).
      if (kind && !n.userInteraction) vibrate(kind);
      if (n.userInteraction && n.userInfo?.doseId) onTap(n.userInfo.doseId);
    },
  });
  PushNotification.createChannel(
    { channelId: 'critical-meds', channelName: 'Critical medication alarms', importance: 5, vibrate: true, playSound: true, soundName: 'default' },
    () => undefined,
  );
}

export function scheduleDoseAlarm(d: Dose) {
  PushNotification.localNotificationSchedule({
    channelId: 'critical-meds',
    title: 'Time for your medicine',
    message: `${d.drug}${d.strengthMg ? ` ${d.strengthMg} mg` : ''}`,
    date: new Date(d.time),
    allowWhileIdle: true,
    priority: 'max',
    importance: 'max',
    visibility: 'public',
    userInfo: { doseId: d.id, kind: (d.critical ? 'critical' : d.period) as HapticKind },
  });
}
