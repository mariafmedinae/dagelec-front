let permissions: any = [];

export const getMenu = () => {
  permissions = JSON.parse(localStorage.getItem('permissions')!);
  return permissions;
};

export const getFormPermissions = (formPK: string) =>
  permissions.filter((item: any) => item.PK === formPK)[0].permissions;

export const verifyPermission = (permissionsList: any, PK: string, action: string) =>
  Boolean(permissionsList.find((item: any) => item.action === action && item.PK === PK));

export const getActionsList = (permissionsList: any, PK: string) =>
  permissionsList.reduce((array: any, current: any) => {
    if (
      current.action !== 'CREATE' &&
      current.action !== 'SEARCH' &&
      current.action !== 'INFORM' &&
      current.PK === PK
    )
      array.push(current.action);
    return array;
  }, []);

export const verifyViewUrl = (viewsList: any, currentPath: string) => {
  const urlData = permissions.find(
    (item: any) => `${import.meta.env.VITE_BASE_URL}dashboard/${item.path}` === currentPath
  );

  if (urlData) return Boolean(viewsList.find((item: any) => item === urlData.PK));
  else return false;
};
