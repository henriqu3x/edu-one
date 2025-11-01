import { Navbar } from "@/components/Navbar";

export default function aTerms() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8 text-center">TERMO DE USO – EDUCA+</h1>

        <div className="prose prose-lg max-w-none">
          {/* <p className="text-sm text-muted-foreground mb-8">Última atualização: {new Date().toLocaleDateString('pt-BR')}</p> */}
          <p className="text-sm text-muted-foreground mb-8">Última atualização: 24/10/2025</p>

          <p className="mb-6">
            Bem-vindo(a) à Educa+ (“Plataforma”). Estes Termos de Uso (“Termos”) regulam o acesso e a utilização do site www.educamais.com e de todos os serviços oferecidos.
          </p>

          <p className="mb-6">
            Ao utilizar a Plataforma, o Usuário declara que leu, compreendeu e concorda integralmente com estes Termos. Caso não concorde, deverá se abster de utilizar o serviço.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">1. Objeto</h2>
          <p className="mb-6">
            A Plataforma tem como objetivo oferecer um ambiente de aprendizagem colaborativa, permitindo que os Usuários:
          </p>
          <ul className="list-disc pl-6 mb-6 space-y-2">
            <li>Acessem vídeos públicos incorporados do YouTube; e</li>
            <li>Enviem seus próprios vídeos diretamente à Plataforma para fins educativos.</li>
          </ul>
          <p className="mb-6">
            O Educa+ atua como provedor de aplicação, disponibilizando a infraestrutura tecnológica para o compartilhamento de conteúdo educativo, sem interferir na autoria, veracidade ou licitude do material publicado pelos Usuários.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">2. Cadastro e acesso</h2>
          <ul className="list-disc pl-6 mb-6 space-y-2">
            <li>O acesso a determinadas funcionalidades requer cadastro prévio, com fornecimento de dados pessoais (ex.: nome e e-mail).</li>
            <li>O Usuário é responsável por manter a confidencialidade de suas credenciais de acesso e não compartilhar sua conta com terceiros.</li>
            <li>O uso indevido da conta ou violação de segurança deverá ser comunicado imediatamente à administração do site.</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-4">3. Envio de vídeos</h2>
          <p className="mb-4">3.1. O Usuário poderá enviar vídeos diretamente à Plataforma, desde que:</p>
          <ul className="list-disc pl-6 mb-6 space-y-2">
            <li>Seja o titular dos direitos autorais e de imagem; ou</li>
            <li>Possua autorização expressa dos titulares para publicação.</li>
          </ul>
          <p className="mb-4">3.2. É estritamente proibido enviar conteúdos que:</p>
          <ul className="list-disc pl-6 mb-6 space-y-2">
            <li>Infrinjam direitos autorais, de imagem ou de propriedade intelectual de terceiros;</li>
            <li>Contenham material ofensivo, discriminatório, pornográfico, difamatório, ilegal ou que viole qualquer norma;</li>
            <li>Tenham finalidade comercial, política ou publicitária não autorizada.</li>
          </ul>
          <p className="mb-6">
            3.3. O Usuário declara ser o único responsável pelo conteúdo que publicar, isentando o Educa+ de qualquer responsabilidade civil ou penal decorrente da publicação.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">4. Licença de uso do conteúdo enviado</h2>
          <p className="mb-4">4.1. Ao enviar um vídeo, o Usuário concede ao Educa+ uma licença gratuita, não exclusiva, mundial e por prazo indeterminado para:</p>
          <ul className="list-disc pl-6 mb-6 space-y-2">
            <li>Exibir, reproduzir, distribuir e comunicar o vídeo dentro da Plataforma;</li>
            <li>Exibi-lo publicamente para fins de divulgação ou promoção do serviço, desde que com crédito ao autor.</li>
          </ul>
          <p className="mb-6">
            4.2. Essa licença não transfere a propriedade intelectual, permanecendo os direitos autorais com o criador original.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">5. Conteúdo de terceiros (YouTube e outros)</h2>
          <ul className="list-disc pl-6 mb-6 space-y-2">
            <li>A Plataforma também pode exibir vídeos incorporados do YouTube ou de outros provedores externos.</li>
            <li>Esses vídeos são exibidos via embed oficial, respeitando os Termos de Serviço das respectivas plataformas.</li>
            <li>O Educa+ não hospeda, copia ou modifica vídeos de terceiros.</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-4">6. Moderação e remoção de conteúdo</h2>
          <ul className="list-disc pl-6 mb-6 space-y-2">
            <li>O Educa+ reserva-se o direito de revisar, moderar, ocultar ou remover vídeos ou perfis que violem estes Termos ou a legislação vigente, sem necessidade de aviso prévio.</li>
            <li>Caso o Usuário acredite que algum conteúdo viole direitos autorais ou legais, poderá solicitar a remoção através do e-mail: contato@educamais.com.</li>
            <li>A equipe da Plataforma analisará o pedido e, se procedente, removerá o conteúdo em até 5 dias úteis.</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-4">7. Responsabilidades</h2>
          <ul className="list-disc pl-6 mb-6 space-y-2">
            <li>O Usuário é exclusivamente responsável por todo conteúdo que publica, incluindo eventuais violações de direitos de terceiros.</li>
            <li>O Educa+ não se responsabiliza por:</li>
            <ul className="list-disc pl-6 mb-6 space-y-2">
              <li>Conteúdo publicado por Usuários ou terceiros;</li>
              <li>Qualquer dano resultante do uso da Plataforma;</li>
              <li>Interrupções, falhas ou indisponibilidade temporária do serviço.</li>
            </ul>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-4">8. Propriedade intelectual</h2>
          <ul className="list-disc pl-6 mb-6 space-y-2">
            <li>O layout, logotipos, textos, design e funcionalidades da Plataforma são de propriedade exclusiva do Educa+ e protegidos por direitos autorais.</li>
            <li>É proibido copiar, reproduzir ou redistribuir qualquer parte da Plataforma sem autorização prévia e por escrito.</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-4">9. Uso adequado</h2>
          <p className="mb-6">
            O Usuário compromete-se a não:
          </p>
          <ul className="list-disc pl-6 mb-6 space-y-2">
            <li>Usar a Plataforma para atividades ilícitas;</li>
            <li>Praticar engenharia reversa, invasão ou extração de dados;</li>
            <li>Utilizar bots, automações ou scripts não autorizados.</li>
          </ul>
          <p className="mb-6">
            A violação destas regras poderá resultar em suspensão ou exclusão definitiva da conta, além de medidas legais.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">10. Alterações dos Termos</h2>
          <p className="mb-6">
            O Educa+ poderá modificar estes Termos a qualquer momento.
            As alterações terão efeito imediato após a publicação.
            O uso contínuo da Plataforma após as mudanças implica concordância integral com os novos termos.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">11. Legislação e foro</h2>
          <p className="mb-6">
            Estes Termos são regidos pelas leis da República Federativa do Brasil.
            Fica eleito o foro da Comarca de São Paulo/SP, com exclusão de qualquer outro, para dirimir eventuais controvérsias.
          </p>

          <div className="mt-12 p-6 bg-muted rounded-lg">
            <h3 className="text-lg font-semibold mb-4">📩 Contato:</h3>
            <p className="mb-2"><strong>E-mail:</strong> contato@educamais.com</p>
            <p><strong>Site:</strong> www.educamais.com</p>
          </div>
        </div>
      </div>
    </div>
  );
}
