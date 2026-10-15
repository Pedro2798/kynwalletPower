import type { Authenticate } from '@/application/authenticate';
import { LoginForm } from '@/ui/features/login/LoginForm';
import { LoginScreen } from '@/ui/features/login/LoginScreen';

type AppProps = {
  authenticate: Authenticate;
};

export function App({ authenticate }: AppProps) {
  return (
    <LoginScreen>
      <LoginForm authenticate={authenticate} />
    </LoginScreen>
  );
}
