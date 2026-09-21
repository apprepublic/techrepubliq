/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  images: {
    unoptimized: true,
    // The logo paths carry a ?v=3 cache-buster. Next 16 rejects unconfigured query
    // strings, so this declares the folder they live in rather than dropping the
    // cache-buster and losing the ability to bust it.
    localPatterns: [{ pathname: "/assets/**" }],
  },
};

export default nextConfig;