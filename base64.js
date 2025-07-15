export const base64Encode = (data) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () =>
      resolve(reader.result.split(',')[1]); // Extract base64
    reader.onerror = reject;
    reader.readAsDataURL(data);
  });
