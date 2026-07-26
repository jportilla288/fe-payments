export function ProcessingScreen() {
  return (
    <section className="centered-state" aria-live="polite">
      <div className="spinner" role="status" aria-label="Procesando el pago" />
      <h2>Procesando tu pago</h2>
      <p className="muted">No cierres ni recargues esta ventana.</p>
    </section>
  );
}
