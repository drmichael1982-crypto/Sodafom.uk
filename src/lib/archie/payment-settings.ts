/** Public shape of an owner-only draft. This does not enable payment collection. */
export type PaymentSettingsDraft = {
  draftEnabled: boolean;
  linkLabel: string;
  signupUrl: string;
};
export type AdminPaymentSettings = PaymentSettingsDraft & {
  mode: 'free';
  collectionEnabled: false;
  editable: boolean;
  updatedAt: string | null;
  message: string;
};
