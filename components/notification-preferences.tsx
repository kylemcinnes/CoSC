type Props = {
  idPrefix?: string;
  defaults?: {
    email: boolean;
    sms: boolean;
    push: boolean;
  };
};

/**
 * Native checkboxes so Server Actions receive standard FormData keys (value "on" when checked).
 */
export function NotificationPreferences({
  idPrefix = "np",
  defaults = { email: true, sms: false, push: false },
}: Props) {
  return (
    <fieldset className="space-y-3 rounded-xl border border-border bg-card p-4">
      <legend className="px-1 text-sm font-medium text-foreground">Notification preferences</legend>
      <p className="text-xs text-muted-foreground">
        Choose how you would like to hear about gatherings, livestreams, and pastoral care moments. You
        can change this anytime.
      </p>
      <div className="flex items-start gap-3">
        <input
          id={`${idPrefix}-email`}
          name="notifyEmail"
          type="checkbox"
          defaultChecked={defaults.email}
          className="mt-1 size-4 rounded border border-input text-primary accent-primary"
        />
        <div className="grid gap-1">
          <label htmlFor={`${idPrefix}-email`} className="text-sm font-medium leading-none">
            Email
          </label>
          <p className="text-xs text-muted-foreground">Best for weekly updates and reminders.</p>
        </div>
      </div>
      <div className="flex items-start gap-3">
        <input
          id={`${idPrefix}-sms`}
          name="notifySms"
          type="checkbox"
          defaultChecked={defaults.sms}
          className="mt-1 size-4 rounded border border-input text-primary accent-primary"
        />
        <div className="grid gap-1">
          <label htmlFor={`${idPrefix}-sms`} className="text-sm font-medium leading-none">
            SMS
          </label>
          <p className="text-xs text-muted-foreground">
            Requires a valid mobile number. Twilio must be configured in Supabase.
          </p>
        </div>
      </div>
      <div className="flex items-start gap-3">
        <input
          id={`${idPrefix}-push`}
          name="notifyPush"
          type="checkbox"
          defaultChecked={defaults.push}
          className="mt-1 size-4 rounded border border-input text-primary accent-primary"
        />
        <div className="grid gap-1">
          <label htmlFor={`${idPrefix}-push`} className="text-sm font-medium leading-none">
            Web push
          </label>
          <p className="text-xs text-muted-foreground">
            Works after you install the church app (PWA) and allow notifications.
          </p>
        </div>
      </div>
    </fieldset>
  );
}
