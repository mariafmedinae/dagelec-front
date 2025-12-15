export const cleanString = (value: string) => {
  if (value) {
    let string = value;

    string = string.replace(/[áàäâÁÀÄÂ]/g, 'a');
    string = string.replace(/[éèëêÉÈËÊ]/g, 'e');
    string = string.replace(/[íìïîÍÌÏÎ]/g, 'i');
    string = string.replace(/[óòöôÓÒÖÔ]/g, 'o');
    string = string.replace(/[úùüûÚÙÜÛ]/g, 'u');
    string = string.replace(/ /g, '');
    string = string.replace(/\./g, '');
    string = string.replace(/-/g, '');
    string = string.toLowerCase();

    return string;
  }

  return undefined;
};
