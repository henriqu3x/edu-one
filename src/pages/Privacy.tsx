import { Navbar } from "@/components/Navbar";

export default function Privacy() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8 text-center">POLÍTICA DE PRIVACIDADE – EDUCA+</h1>

        <div className="prose prose-lg max-w-none">
          <p className="text-sm text-muted-foreground mb-8">Última atualização: {new Date().toLocaleDateString('pt-BR')}</p>

          <p className="mb-6">
            A presente Política de Privacidade tem por finalidade informar de forma clara e transparente como o Educa+ ("Plataforma", "nós", "nosso") coleta, utiliza, armazena e protege os dados pessoais dos usuários ("Usuário") que acessam e utilizam o site www.educamais.com.
          </p>

          <p className="mb-6">
            Ao se cadastrar ou utilizar a Plataforma, o Usuário declara ter lido, compreendido e concordado com esta Política.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">1. Controlador dos dados</h2>
          <p className="mb-6">
            Os dados pessoais coletados são controlados por:
          </p>
          <div className="mb-6 p-4 bg-muted rounded">
            <p><strong>Educa+</strong></p>
            <p>CNPJ: [A ser definido]</p>
            <p>E-mail para contato: contato@educamais.com</p>
            <p>Endereço: Fortaleza/CE</p>
          </div>

          <h2 className="text-2xl font-semibold mt-8 mb-4">2. Dados pessoais coletados</h2>
          <p className="mb-4">Podemos coletar e armazenar os seguintes dados pessoais:</p>
          <ul className="list-disc pl-6 mb-6 space-y-2">
            <li>Nome completo (quando informado voluntariamente)</li>
            <li>Endereço de e-mail (necessário para login e comunicação)</li>
            <li>Senha de acesso (armazenada de forma criptografada)</li>
            <li>Dados técnicos de acesso: endereço IP, data e hora de acesso, tipo de dispositivo e navegador</li>
          </ul>
          <p className="mb-6">
            <strong>Importante:</strong> Não armazenamos senhas em formato legível nem coletamos dados sensíveis (como origem racial, opiniões políticas, saúde, religião, etc.).
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">3. Finalidade do tratamento</h2>
          <p className="mb-4">Os dados pessoais são utilizados para:</p>
          <ul className="list-disc pl-6 mb-6 space-y-2">
            <li>Criar e gerenciar a conta do Usuário;</li>
            <li>Permitir o acesso à Plataforma e seus recursos;</li>
            <li>Enviar comunicações operacionais e de suporte;</li>
            <li>Melhorar a experiência de navegação e segurança;</li>
            <li>Cumprir obrigações legais ou regulatórias.</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-4">4. Compartilhamento de dados</h2>
          <p className="mb-4">O Educa+ não vende nem compartilha dados pessoais com terceiros, salvo:</p>
          <ul className="list-disc pl-6 mb-6 space-y-2">
            <li>Quando necessário para prestadores de serviço que auxiliam na operação da Plataforma (ex.: provedores de hospedagem, autenticação, e-mail);</li>
            <li>Quando exigido por ordem judicial ou autoridade competente;</li>
            <li>Quando houver consentimento expresso do Usuário.</li>
          </ul>
          <p className="mb-6">
            Todos os parceiros são contratualmente obrigados a manter o mesmo nível de segurança e confidencialidade exigido por esta Política.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">5. Armazenamento e segurança dos dados</h2>
          <p className="mb-4">Adotamos medidas técnicas e administrativas de segurança, como:</p>
          <ul className="list-disc pl-6 mb-6 space-y-2">
            <li>Criptografia de senhas e conexões (HTTPS);</li>
            <li>Controle de acesso restrito a dados pessoais;</li>
            <li>Monitoramento de tentativas de acesso indevido;</li>
            <li>Backups regulares e servidores protegidos.</li>
          </ul>
          <p className="mb-6">
            Os dados são armazenados enquanto a conta estiver ativa ou enquanto necessários para cumprimento de obrigações legais.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">6. Direitos do titular (Usuário)</h2>
          <p className="mb-4">Nos termos da Lei Geral de Proteção de Dados (LGPD), o Usuário pode a qualquer momento:</p>
          <ul className="list-disc pl-6 mb-6 space-y-2">
            <li>Solicitar acesso, correção ou exclusão de seus dados pessoais;</li>
            <li>Solicitar a portabilidade dos dados;</li>
            <li>Revogar o consentimento;</li>
            <li>Solicitar informações sobre o uso e o compartilhamento de seus dados.</li>
          </ul>
          <p className="mb-6">
            Os pedidos podem ser feitos pelo e-mail: contato@educamais.com.
            Responderemos dentro do prazo legal de até 15 dias.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">7. Cookies e tecnologias similares</h2>
          <p className="mb-4">Podemos utilizar cookies estritamente necessários para:</p>
          <ul className="list-disc pl-6 mb-6 space-y-2">
            <li>Manter o login do Usuário ativo;</li>
            <li>Guardar preferências de navegação;</li>
            <li>Medir desempenho e melhorar a experiência da Plataforma.</li>
          </ul>
          <p className="mb-6">
            O Usuário pode configurar seu navegador para bloquear cookies, mas isso poderá limitar algumas funcionalidades do site.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">8. Exclusão de dados e encerramento de conta</h2>
          <p className="mb-6">
            O Usuário pode solicitar a exclusão de sua conta e dados pessoais a qualquer momento.
            Após o pedido, os dados serão removidos em até 30 dias, salvo quando o armazenamento for exigido por lei.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">9. Alterações desta Política</h2>
          <p className="mb-6">
            Esta Política poderá ser atualizada periodicamente.
            As alterações entrarão em vigor imediatamente após a publicação no site.
            O uso contínuo da Plataforma após a atualização implica concordância com os novos termos.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">10. Contato</h2>
          <p className="mb-4">Em caso de dúvidas, solicitações ou reclamações sobre esta Política, entre em contato com nosso Encarregado de Proteção de Dados (DPO):</p>
          <div className="mb-6 p-4 bg-muted rounded">
            <p><strong>Nome:</strong> Luiz Henrique</p>
            <p><strong>E-mail:</strong> contato@educamais.com</p>
            <p><strong>Assunto:</strong> "Proteção de Dados – Educa+"</p>
          </div>

          <h2 className="text-2xl font-semibold mt-8 mb-4">11. Legislação aplicável</h2>
          <p className="mb-6">
            Esta Política é regida pelas leis da República Federativa do Brasil, em especial pela Lei nº 13.709/2018 (LGPD).
            Fica eleito o foro da Comarca de São Paulo/SP para dirimir eventuais controvérsias.
          </p>

          <div className="mt-12 p-6 bg-muted rounded-lg text-center">
            <p className="text-lg font-semibold">📍 Educa+ – Todos os direitos reservados © {new Date().getFullYear()}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
