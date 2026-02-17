export interface Organisation {
  orgId: number;
  orgName: string;
  orgCode: string;
  phone: string | null;
  email: string | null;
  gstin: string | null;
  panNo: string | null;
  brandColor: string | null;
  logo: string | null;
  fullLogo?: string | null;
  stateCode: string | null;
  website: string | null;
  addressLine1: string | null;
  addressLine2: string | null;
  pinCode: string | null;
  city: string | null;
  state: string | null;
}
