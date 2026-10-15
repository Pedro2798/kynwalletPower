import { useEffect, useRef } from 'react';
import { Button } from '@/ui/components/Button/Button';
import styles from './WelcomeView.module.css';

type WelcomeViewProps = {
  name: string;
  onLogout: () => void;
};

export function WelcomeView({ name, onLogout }: WelcomeViewProps) {
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  return (
    <section className={styles.welcome}>
      <h1 ref={headingRef} tabIndex={-1} className={styles.title}>
        ¡Bienvenido, {name}!
      </h1>
      <p className={styles.subtitle}>Iniciaste sesión correctamente en KynWallet.</p>
      <Button onClick={onLogout}>Cerrar sesión</Button>
    </section>
  );
}
