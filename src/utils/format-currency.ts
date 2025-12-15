export const formatCurrency = (value: any) => {
  if (!value) return '';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value);
};

export const parseCurrency = (formattedValue: any) =>
  parseFloat(formattedValue.replace(/[^0-9.-]+/g, ''));
