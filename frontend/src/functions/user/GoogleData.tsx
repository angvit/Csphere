import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";

interface GoogleDecodeInterface {
  aud: string;
  azp: string;
  email: string;
  email_verified: boolean;
  exp: number;
  family_name: string;
  given_name: string;
  iat: number;
  iss: string;
  jti: string;
  name: string;
  nbf: number;
  picture: string;
  sub: string;
}

interface GoogleUserData {
  username: String;
  email: String;
  google_id: string;
}

const fetchGoogleCredential = (credentials: any): GoogleUserData => {
  try {
    const data: GoogleDecodeInterface = jwtDecode(credentials.credential);

    const googleUserInfo: GoogleUserData = {
      username: data.name,
      email: data.email,
      google_id: data.sub,
    };

    return googleUserInfo;
  } catch (error) {
    console.log("error in fetching google credentials: ", error);
  }
};

export { fetchGoogleCredential };
