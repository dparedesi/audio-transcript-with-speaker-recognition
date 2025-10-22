export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      if (typeof reader.result !== 'string') {
        return reject(new Error('File could not be read as a data URL.'));
      }
      // The result is in the format "data:audio/mp4;base64,..."
      // We need to remove the prefix to get just the base64 string
      const base64String = reader.result.split(',')[1];
      if (!base64String) {
        return reject(new Error('Could not extract base64 string from file.'));
      }
      resolve(base64String);
    };
    reader.onerror = error => reject(error);
  });
};
