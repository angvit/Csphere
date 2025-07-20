import { UUID } from "crypto";

import { fetchToken } from "@/functions/user/UserData";

interface FolderCreateProps {
  foldername: string;
  folderId: string | null;
}

let BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const createFolder = async ({
  foldername,
  folderId = null,
}: FolderCreateProps) => {
  let API_URL = BASE_URL;
  if (folderId !== null) {
    API_URL = API_URL + "";
  } else {
    API_URL = API_URL + "/user/folder/create";
  }

  // const token = fetchToken();
  const token = fetchToken();

  console.log("current token: ", token);

  try {
    const folderData: FolderCreateProps = {
      foldername: foldername,
      folderId: folderId,
    };

    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(folderData),
    });

    const data = await response.json();

    if (data.success) {
      return data.folder_details;
    }
  } catch (e) {
    console.log("error occured in foldercreate: ", e);
  }
};

export { createFolder };
