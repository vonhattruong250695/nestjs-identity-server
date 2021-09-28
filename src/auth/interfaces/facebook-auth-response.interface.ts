export interface IFacebookAuthResponse {
  id: string;
  name: {
    familyName: string;
    givenName: string;
  };
  photos: Array<{
    value: string;
  }>;
  emails?: Array<{
    value: string;
  }>;
}
