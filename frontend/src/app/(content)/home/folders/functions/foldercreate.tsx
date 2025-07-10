import { UUID } from "crypto";

import { fetchToken } from "@/functions/user/UserData";

interface FolderCreateProps {
  folderName: string;
  parentFolderId: UUID | null;
}

let BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const createFolder = async ({
  folderName,
  parentFolderId = null,
}: FolderCreateProps) => {
  let API_URL = BASE_URL;
  if (parentFolderId !== null) {
    API_URL = API_URL + "";
  } else {
    API_URL = API_URL + "/user/folder/create";
  }

  const token = fetchToken();

  try {
    const folderData: FolderCreateProps = {
      folderName: folderName,
      parentFolderId: parentFolderId,
    };

    const response = await fetch(API_URL, {
      headers: {
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
