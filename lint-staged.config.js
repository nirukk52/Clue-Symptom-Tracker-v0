module.exports = {
  '**/*.{js,jsx,ts,tsx}': (filenames) => {
    const filtered = filenames.filter(
      (f) => !f.startsWith('web-landing-next/')
    );
    if (filtered.length === 0) return [];
    return [
      `npx eslint --fix ${filtered.map((filename) => `"${filename}"`).join(' ')}`,
    ];
  },
  '**/*.(md|json)': (filenames) =>
    `npx prettier --write ${filenames
      .map((filename) => `"${filename}"`)
      .join(' ')}`,
  'src/translations/*.(json)': (filenames) => [
    `npx eslint --fix ${filenames
      .map((filename) => `"${filename}"`)
      .join(' ')}`,
  ],
};
