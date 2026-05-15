import { useState } from 'react';
import {
  VStack,
  Text,
  Input,
  InputField,
  Button,
  ButtonText,
  ButtonSpinner,
  FormControl,
  FormControlLabel,
  FormControlLabelText,
  FormControlError,
  FormControlErrorText,
  Heading,
} from '@gluestack-ui/themed';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { fetchApi } from '@/lib/api';
import { salvarToken } from '@/lib/auth';
import type { RespostaLogin } from '@fleetops/types';

export default function TelaLogin() {
  const router = useRouter();
  const [matricula, setMatricula] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);

  async function handleLogin() {
    if (!matricula || !senha) {
      setErro('Preencha a matrícula e a senha');
      return;
    }

    setErro(null);
    setCarregando(true);

    try {
      const dados = await fetchApi<RespostaLogin>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ matricula, senha }),
      });

      await salvarToken(dados.token);
      router.replace('/(motorista)');
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Credenciais inválidas');
    } finally {
      setCarregando(false);
    }
  }

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: '#0A2540',
        justifyContent: 'center',
        paddingHorizontal: 24,
      }}
      edges={['top', 'bottom', 'left', 'right']}
    >
      <VStack space="xl">
        {/* Logo */}
        <VStack space="xs" mb="$6">
          <Heading size="3xl" color="$white" fontWeight="$bold">
            FleetOps
          </Heading>
          <Text color="#00C2FF" size="md">
            Gestão de Frota Corporativa
          </Text>
        </VStack>

        {/* Formulário */}
        <VStack space="lg" backgroundColor="rgba(255,255,255,0.05)" p="$6" borderRadius="$xl">
          <FormControl isInvalid={!!erro}>
            <FormControlLabel>
              <FormControlLabelText color="$white" size="sm">
                Matrícula
              </FormControlLabelText>
            </FormControlLabel>
            <Input
              variant="outline"
              borderColor="rgba(255,255,255,0.2)"
              sx={{ ':focus': { borderColor: '#0066FF' } }}
            >
              <InputField
                color="$white"
                placeholderTextColor="rgba(255,255,255,0.4)"
                placeholder="0000000000"
                keyboardType="numeric"
                maxLength={10}
                value={matricula}
                onChangeText={setMatricula}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </Input>
          </FormControl>

          <FormControl isInvalid={!!erro}>
            <FormControlLabel>
              <FormControlLabelText color="$white" size="sm">
                Senha
              </FormControlLabelText>
            </FormControlLabel>
            <Input
              variant="outline"
              borderColor="rgba(255,255,255,0.2)"
              sx={{ ':focus': { borderColor: '#0066FF' } }}
            >
              <InputField
                color="$white"
                placeholderTextColor="rgba(255,255,255,0.4)"
                placeholder="••••••••"
                secureTextEntry
                value={senha}
                onChangeText={setSenha}
              />
            </Input>
            {erro && (
              <FormControlError>
                <FormControlErrorText color="#F87171">{erro}</FormControlErrorText>
              </FormControlError>
            )}
          </FormControl>

          <Button
            onPress={handleLogin}
            isDisabled={carregando}
            backgroundColor="#0066FF"
            sx={{ ':active': { backgroundColor: '#0047B3' } }}
            borderRadius="$lg"
            mt="$2"
          >
            {carregando ? (
              <ButtonSpinner color="$white" />
            ) : (
              <ButtonText color="$white" fontWeight="$semibold">
                Entrar
              </ButtonText>
            )}
          </Button>
        </VStack>
      </VStack>
    </SafeAreaView>
  );
}
