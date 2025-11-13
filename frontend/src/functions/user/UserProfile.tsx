import { jwtDecode } from "jwt-decode";
type DecodedToken = {
  sub: string;
  email: string;
  username: string;
  role: string;
  exp: number;
  profilePath: string;
};
interface UserData {
  username: string;
  email: string;
  profilePath: string;
}

const getUserInfo = async () => {
  try {
    const token = document.cookie
      .split("; ")
      .find((row) => row.startsWith("token="))
      ?.split("=")[1];
    const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/user/profile/info`;
    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    console.log("response: ", response);

    const data: UserData = await response.json();

    return data;
  } catch (error) {
    console.log("error in getUserInfo: ", error);
  }
};

const DecodeToken = (): DecodedToken => {
  const token_data = document.cookie
    .split("; ")
    .find((row) => row.startsWith("token="))
    ?.split("=")[1];

  const decoded: DecodedToken = jwtDecode(token_data as string);

  return decoded;
};

export { getUserInfo, DecodeToken };
