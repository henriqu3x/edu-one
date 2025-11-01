import { Navbar } from "@/components/Navbar";

export default function Privacy() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8 text-center">POLÍTICA DE PRIVACIDADE – EDUCA+</h1>

        <div className="prose prose-lg max-w-none">
          {/* <p className="text-sm text-muted-foreground mb-8">Última atualização: {new Date().toLocaleDateString('pt-BR')}</p> */}
          <p className="text-sm text-muted-foreground mb-8">Última atualização: 24/10/2025</p>

          <p className="mb-6">
            A presente Política de Privacidade descreve como o Educa+ (“Plataforma”, “nós”, “nosso”) coleta, utiliza, armazena e protege os dados pessoais dos usuários (“Usuário”) que acessam e utilizam o site www.educamais.com e seus serviços associados.
          </p>

          <p className="mb-6">
            Ao criar uma conta, enviar conteúdo ou utilizar a Plataforma, o Usuário declara ter lido, compreendido e concordado com esta Política.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">1. Controlador dos dados</h2>
          <p className="mb-6">
            Os dados pessoais são controlados por:
          </p>
          <div className="mb-6 p-4 bg-muted rounded">
            <p><strong>Educa+</strong></p>
            <p>CNPJ: [A ser definido]</p>
            <p>E-mail: contato@educamais.com</p>
            <p>Endereço: Fortaleza/CE</p>
          </div>
          <p className="mb-6">
            Para fins da Lei nº 13.709/2018 (Lei Geral de Proteção de Dados – LGPD), o Educa+ atua como controlador dos dados pessoais tratados por meio da Plataforma.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">2. Dados pessoais coletados</h2>
          <p className="mb-6">
            Podemos coletar e armazenar as seguintes informações:
          </p>
          <ul className="list-disc pl-6 mb-6 space-y-2">
            <li>Dados de cadastro: nome, e-mail e senha de acesso (armazenada de forma criptografada);</li>
            <li>Dados técnicos: endereço IP, tipo de navegador, dispositivo, data e hora de acesso;</li>
            <li>Conteúdo enviado: vídeos, imagens e demais arquivos enviados voluntariamente pelo Usuário;</li>
            <li>Dados de comunicação: mensagens ou solicitações enviadas por e-mail ou por formulários da Plataforma.</li>
          </ul>
          <p className="mb-6">
            Não solicitamos dados sensíveis, exceto quando o próprio Usuário os incluir voluntariamente em seus vídeos ou mensagens — sendo, neste caso, integralmente responsável pelo conteúdo.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">3. Finalidade do tratamento</h2>
          <p className="mb-6">
            Os dados pessoais e arquivos enviados são utilizados para:
          </p>
          <ul className="list-disc pl-6 mb-6 space-y-2">
            <li>Criar e gerenciar contas de Usuários;</li>
            <li>Permitir o login e acesso à Plataforma;</li>
            <li>Armazenar e exibir vídeos enviados para fins educacionais;</li>
            <li>Melhorar a experiência de navegação e segurança;</li>
            <li>Enviar comunicações técnicas e operacionais;</li>
            <li>Cumprir obrigações legais e regulatórias.</li>
          </ul>
          <p className="mb-6">
            O tratamento dos dados ocorre com base nas hipóteses legais da execução de contrato (art. 7º, V da LGPD) e consentimento (art. 7º, I da LGPD).
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">4. Armazenamento em provedores de nuvem (Cloudinary)</h2>
          <p className="mb-6">
            Os vídeos e arquivos enviados são armazenados em servidores do Cloudinary, que atua como operador de dados em nome do Educa+.
          </p>
          <p className="mb-6">
            O Cloudinary é um provedor internacional de armazenamento em nuvem que adota padrões avançados de segurança e certificações de conformidade (ISO, GDPR).
            Como o processamento pode ocorrer fora do território brasileiro, pode haver transferência internacional de dados, a qual é realizada de forma segura e em conformidade com a LGPD.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">5. Compartilhamento de dados</h2>
          <p className="mb-6">
            O Educa+ não vende nem compartilha dados pessoais com terceiros, exceto:
          </p>
          <ul className="list-disc pl-6 mb-6 space-y-2">
            <li>Quando necessário para prestadores de serviços essenciais (ex.: Cloudinary, provedores de hospedagem, e-mail ou autenticação);</li>
            <li>Quando exigido por ordem judicial ou autoridade competente;</li>
            <li>Quando houver consentimento expresso do Usuário.</li>
          </ul>
          <p className="mb-6">
            Todos os prestadores de serviço são contratualmente obrigados a manter o mesmo nível de segurança e confidencialidade exigido por esta Política.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">6. Responsabilidade pelo conteúdo enviado</h2>
          <p className="mb-6">
            O Usuário é exclusivamente responsável pelos vídeos e materiais que enviar à Plataforma, devendo garantir que:
          </p>
          <ul className="list-disc pl-6 mb-6 space-y-2">
            <li>Possui os direitos autorais e de imagem sobre o conteúdo;</li>
            <li>O conteúdo não infringe direitos de terceiros, nem viola leis ou políticas da Plataforma.</li>
          </ul>
          <p className="mb-6">
            O Educa+ não se responsabiliza por vídeos, imagens ou dados pessoais de terceiros incluídos nos envios feitos pelos Usuários.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">7. Segurança da informação</h2>
          <p className="mb-6">
            Adotamos medidas técnicas e administrativas para proteger os dados pessoais contra acessos não autorizados, perda, destruição ou alteração, incluindo:
          </p>
          <ul className="list-disc pl-6 mb-6 space-y-2">
            <li>Criptografia de senhas e conexões (HTTPS);</li>
            <li>Controle de acesso restrito a informações pessoais;</li>
            <li>Armazenamento seguro em servidores de nuvem com certificações internacionais;</li>
            <li>Backups regulares e monitoramento de segurança.</li>
          </ul>
          <p className="mb-6">
            Apesar dos esforços, nenhum sistema é totalmente livre de riscos. O Usuário reconhece que fornece dados sob sua responsabilidade e ciência dos riscos inerentes à utilização de serviços online.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">8. Direitos do titular dos dados</h2>
          <p className="mb-6">
            Nos termos da LGPD, o Usuário pode, a qualquer momento:
          </p>
          <ul className="list-disc pl-6 mb-6 space-y-2">
            <li>Solicitar confirmação da existência de tratamento;</li>
            <li>Requerer acesso, correção ou atualização de dados;</li>
            <li>Solicitar a exclusão de sua conta e vídeos enviados;</li>
            <li>Solicitar portabilidade para outro serviço;</li>
            <li>Revogar o consentimento dado;</li>
            <li>Solicitar informações sobre o compartilhamento de dados.</li>
          </ul>
          <p className="mb-6">
            Os pedidos devem ser enviados para contato@educamais.com, com resposta no prazo legal de até 15 dias.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">9. Exclusão de dados e vídeos</h2>
          <p className="mb-6">
            O Usuário pode solicitar a exclusão definitiva de sua conta e dos vídeos enviados.
            Após o pedido, os dados e arquivos serão removidos tanto da Plataforma quanto do provedor de armazenamento (Cloudinary) em até 30 dias, salvo quando o armazenamento for exigido por lei.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">10. Cookies e tecnologias similares</h2>
          <p className="mb-6">
            A Plataforma utiliza cookies estritamente necessários para:
          </p>
          <ul className="list-disc pl-6 mb-6 space-y-2">
            <li>Manter a sessão do Usuário ativa;</li>
            <li>Armazenar preferências de navegação;</li>
            <li>Melhorar o desempenho e segurança do site.</li>
          </ul>
          <p className="mb-6">
            O Usuário pode desativar os cookies no navegador, mas isso pode limitar algumas funcionalidades.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">11. Alterações desta Política</h2>
          <p className="mb-6">
            Esta Política poderá ser modificada a qualquer momento, visando refletir mudanças legais, tecnológicas ou operacionais.
            A nova versão entrará em vigor na data de sua publicação no site.
            O uso contínuo da Plataforma após as alterações implicará aceitação da nova versão.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">12. Contato</h2>
          <p className="mb-4">Em caso de dúvidas, solicitações ou reclamações, entre em contato com nosso Encarregado de Proteção de Dados (DPO):</p>
          <div className="mb-6 p-4 bg-muted rounded">
            <p><strong>Nome:</strong> Luiz Henrique</p>
            <p><strong>E-mail:</strong> contato@educamais.com</p>
            <p><strong>Assunto:</strong> "Proteção de Dados – Educa+"</p>
          </div>

          <h2 className="text-2xl font-semibold mt-8 mb-4">13. Legislação aplicável</h2>
          <p className="mb-6">
            Esta Política é regida pelas leis da República Federativa do Brasil, especialmente pela Lei nº 13.709/2018 (LGPD).
            Fica eleito o foro da Comarca de São Paulo/SP, com exclusão de qualquer outro, para dirimir eventuais controvérsias.
          </p>

          <div className="mt-12 p-6 bg-muted rounded-lg text-center">
            <p className="text-lg font-semibold">📍 Educa+ – Todos os direitos reservados © {new Date().getFullYear()}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
