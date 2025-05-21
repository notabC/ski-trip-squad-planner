export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
  }).format(amount);
};

/**
 * Safely renders HTML content in React components
 * @param htmlContent The HTML content to parse and make safe
 * @returns An object with dangerouslySetInnerHTML property
 */
export const parseHtml = (htmlContent: string) => {
  return { dangerouslySetInnerHTML: { __html: htmlContent } };
};
