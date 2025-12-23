// let permissions: any = [];
const permissions = [
  {
    PK: 'ITEM',
    SK: 'ITEM',
    category: 'Menú Principal',
    description: 'Acá podrás administrar la base de datos de productos.',
    icon: 'fluent:food-grains-20-filled',
    index: 2,
    name: 'Base de datos de productos',
    path: 'item-coding',
    permissions: [
      {
        PK: 'ITEM',
        action: 'INFORM',
        type: 'ALL',
      },
      {
        PK: 'ITEM',
        action: 'UPDATE',
        type: 'ALL',
      },
      {
        PK: 'ITEM',
        action: 'DELETE',
        type: 'ALL',
      },
      {
        PK: 'ITEM',
        action: 'SEARCH',
        type: 'ALL',
      },
      {
        PK: 'ITEM',
        action: 'CREATE',
        type: 'ALL',
      },
    ],
  },
  {
    PK: 'ENTERPRISE',
    SK: 'ENTERPRISE',
    category: 'Menú Principal',
    description: 'Acá podrás administrar tus clientes.',
    icon: 'material-symbols:enterprise',
    index: 1,
    name: 'Registro cliente',
    path: 'client-registration',
    permissions: [
      {
        action: 'CREATE',
        PK: 'CONTACT',
        mainEntity: 'ENTERPRISE',
        type: 'ALL',
      },
      {
        action: 'UPDATE',
        PK: 'CONTACT',
        mainEntity: 'ENTERPRISE',
        type: 'ALL',
      },
      {
        PK: 'ENTERPRISE',
        action: 'UPDATE',
        type: 'ALL',
      },
      {
        PK: 'ENTERPRISE',
        action: 'MANAGE',
        type: 'ALL',
      },
      {
        PK: 'ENTERPRISE',
        action: 'CREATE',
        type: 'ALL',
      },
      {
        PK: 'ENTERPRISE',
        action: 'SEARCH',
        type: 'ALL',
      },
      {
        PK: 'ENTERPRISE',
        action: 'INFORM',
        type: 'ALL',
      },
    ],
  },
  {
    PK: 'USER',
    SK: 'USER',
    category: 'Talento Humano',
    description: 'Acá podrás administrar los usuarios.',
    icon: 'mdi:user',
    index: 0,
    name: 'Registro Personal',
    path: 'personal-registration',
    permissions: [
      {
        PK: 'USER',
        action: 'INFORM',
        type: 'ALL',
      },
      {
        PK: 'USER',
        action: 'SEARCH',
        type: 'ALL',
      },
      {
        PK: 'USER',
        action: 'CREATE',
        type: 'ALL',
      },
      {
        PK: 'USER',
        action: 'UPDATE',
        type: 'ALL',
      },
    ],
  },
];

export const getMenu = () => permissions;

// export const getMenu = () => {
//   permissions = JSON.parse(localStorage.getItem('permissions')!);
//   return permissions;
// };

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
