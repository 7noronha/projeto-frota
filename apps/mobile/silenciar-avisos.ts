/**
 * Filtra avisos de bibliotecas que nao temos como corrigir no nosso codigo.
 *
 * Precisa ser o PRIMEIRO import do app/_layout.tsx (antes do
 * @gluestack-ui/themed) para sobrescrever console.warn antes de o barrel
 * do Gluestack importar o SafeAreaView depreciado do react-native.
 *
 * Diferente do LogBox.ignoreLogs (que so esconde o overlay no app), isto
 * tambem remove a linha WARN do terminal do Metro.
 *
 * O aviso some de vez na futura migracao para o Gluestack v2.
 */
const PADROES_IGNORADOS = ['SafeAreaView has been deprecated'];

const warnOriginal = console.warn.bind(console);

console.warn = ((...args: Parameters<typeof console.warn>) => {
  const primeiro = args[0];
  if (typeof primeiro === 'string' && PADROES_IGNORADOS.some((p) => primeiro.includes(p))) {
    return;
  }
  warnOriginal(...args);
}) as typeof console.warn;
