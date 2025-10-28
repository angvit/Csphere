import { fetchToken } from "@/functions/user/UserData";

const fetchHomeFolders = async () => {
  try {
    const API_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL}/folder`;

    const token = fetchToken();
    const response = await fetch(API_URL, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (data.success) {
      return data.data;
    }
  } catch (error) {
    console.log("error in fetchHomeFolders: ", error);
  }
};

export { fetchHomeFolders };
