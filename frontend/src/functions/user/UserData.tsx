import { jwtDecode } from "jwt-decode";

type DecodedToken = {
  sub: string;
  email: string;
  username: string;
  role: string;
  exp: number;
  profilePath: string;
};

const fetchToken = () => {
  const token_data = document.cookie
    .split("; ")
    .find((row) => row.startsWith("token="))
    ?.split("=")[1];

  const decodedToken: DecodedToken = jwtDecode(token_data as string);

  if (token_data == null) {
    return "";
  }
  return decodedToken;
};
