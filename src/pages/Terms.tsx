import { Navbar } from "@/components/Navbar";

export default function Terms() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8 text-center">TERMO DE USO DA PLATAFORMA EDUCA+</h1>

        <div className="prose prose-lg max-w-none">
          <p className="text-sm text-muted-foreground mb-8">Última atualização: {new Date().toLocaleDateString('pt-BR')}</p>

          <p className="mb-6">
            Bem-vindo(a) à plataforma Educa+ ("Plataforma"). Estes Termos de Uso ("Termos") regulam o acesso e a utilização do site www.educamais.com e de todos os serviços nele disponibilizados.
          </p>

          <p className="mb-6">
            Ao acessar ou utilizar a Plataforma, o usuário ("Usuário") declara que leu, entendeu e concorda integralmente com estes Termos. Caso não concorde, deverá se abster de utilizar a Plataforma.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">1. Objeto</h2>
          <p className="mb-6">
            A Plataforma tem como objetivo reunir e disponibilizar links e incorporações de vídeos educativos hospedados no YouTube, organizados em formato de cursos, sem armazenar ou reproduzir diretamente qualquer conteúdo audiovisual.
          </p>
          <p className="mb-6">
            O Educa+ atua apenas como agregador de conteúdo público do YouTube, não sendo responsável pela criação, autoria ou propriedade dos vídeos exibidos.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">2. Funcionamento da Plataforma</h2>
          <ul className="list-disc pl-6 mb-6 space-y-2">
            <li>Os vídeos disponibilizados são obtidos exclusivamente por meio de incorporações ("embeds") autorizadas pelo próprio YouTube, respeitando seus Termos de Serviço.</li>
            <li>Nenhum vídeo é hospedado, armazenado, baixado ou redistribuído pelos servidores da Plataforma.</li>
            <li>Todos os vídeos permanecem sob a titularidade e controle dos respectivos criadores e canais do YouTube.</li>
            <li>Caso um vídeo seja removido ou torne-se privado no YouTube, ele automaticamente deixará de estar disponível na Plataforma.</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-4">3. Responsabilidade sobre o conteúdo</h2>
          <ul className="list-disc pl-6 mb-6 space-y-2">
            <li>A responsabilidade pelo conteúdo dos vídeos é exclusivamente dos canais e autores originais no YouTube.</li>
            <li>A Plataforma não revisa, edita ou valida o conteúdo publicado, e não se responsabiliza por informações incorretas, opiniões ou materiais protegidos por direitos autorais exibidos nos vídeos.</li>
            <li>O Usuário reconhece que qualquer uso ou confiança depositada nos vídeos é de sua responsabilidade exclusiva.</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-4">4. Propriedade intelectual</h2>
          <ul className="list-disc pl-6 mb-6 space-y-2">
            <li>Todo o conteúdo textual, design, logotipos, layout e funcionalidades da Plataforma são de propriedade do Educa+ e protegidos por leis de propriedade intelectual.</li>
            <li>Os vídeos exibidos permanecem protegidos pelos direitos autorais de seus respectivos criadores e não podem ser baixados, reproduzidos, redistribuídos ou comercializados fora do YouTube.</li>
            <li>É proibido remover, ocultar ou alterar qualquer crédito ou identificação de autoria dos vídeos.</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-4">5. Uso adequado da Plataforma</h2>
          <p className="mb-4">O Usuário compromete-se a:</p>
          <ul className="list-disc pl-6 mb-6 space-y-2">
            <li>Não inserir vídeos que infrinjam direitos autorais ou políticas do YouTube;</li>
            <li>Não utilizar a Plataforma para fins ilícitos, ofensivos ou discriminatórios;</li>
            <li>Não tentar manipular, extrair dados, ou interferir no funcionamento técnico do site.</li>
          </ul>
          <p className="mb-6">
            A violação destas regras poderá resultar na suspensão ou exclusão da conta, além de medidas legais cabíveis.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">6. Remoção de conteúdo</h2>
          <p className="mb-6">
            Caso algum vídeo ou material disponível na Plataforma viole direitos autorais ou legais, o titular poderá solicitar a remoção enviando notificação para contato@educamais.com, comprovando a titularidade e a infração alegada.
            A equipe do Educa+ analisará o pedido e, se procedente, removerá o conteúdo imediatamente.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">7. Isenção de responsabilidade</h2>
          <p className="mb-4">O Educa+ não garante:</p>
          <ul className="list-disc pl-6 mb-6 space-y-2">
            <li>A disponibilidade contínua da Plataforma;</li>
            <li>A veracidade, atualidade ou legalidade do conteúdo dos vídeos;</li>
            <li>Que o conteúdo seja adequado a qualquer finalidade específica.</li>
          </ul>
          <p className="mb-6">
            Em nenhuma hipótese o Educa+ será responsável por perdas, danos ou prejuízos decorrentes do uso da Plataforma ou dos vídeos nela exibidos.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">8. Alterações nos Termos</h2>
          <p className="mb-6">
            O Educa+ poderá alterar estes Termos a qualquer momento. As modificações terão efeito imediato após sua publicação. O uso continuado da Plataforma implica aceitação das novas condições.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">9. Legislação aplicável e foro</h2>
          <p className="mb-6">
            Estes Termos são regidos pelas leis da República Federativa do Brasil.
            Fica eleito o foro da Comarca de São Paulo/SP, com exclusão de qualquer outro, por mais privilegiado que seja, para dirimir eventuais controvérsias decorrentes destes Termos.
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
