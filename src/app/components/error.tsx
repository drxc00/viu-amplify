import { Layout } from "./layout";

export function Error() {
  return (
    <Layout>
      <h1 className="text-primary text-xl font-bold">VAmplify Error</h1>
      <p className="text-foreground text-center">
        Unsupported site. Please visit viu.com
      </p>
    </Layout>
  );
}
