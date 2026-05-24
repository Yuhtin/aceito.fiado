import Link from "next/link";

import { Logo } from "@/components/brand/logo";

export function SiteFooter() {
  return (
    <footer className="border-t border-border/60 bg-background">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-12 md:grid-cols-4">
        <div className="md:col-span-2 max-w-md">
          <Logo size={22} />
          <p className="mt-4 text-sm text-muted-foreground text-pretty">
            Capital de giro pra cadeia afroempreendedora. A empreendedora compra
            a prazo do fornecedor parceiro, ele recebe à vista, a gente cobra
            do recebível. Sem Serasa, sem peneira, sem letrinha miúda.
          </p>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-foreground">Produto</h4>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            <li>
              <Link href="/#como-funciona" className="hover:text-foreground">
                Como funciona
              </Link>
            </li>
            <li>
              <Link href="/#para-fornecedores" className="hover:text-foreground">
                Para fornecedores
              </Link>
            </li>
            <li>
              <Link href="/cadastro" className="hover:text-foreground">
                Cadastro
              </Link>
            </li>
            <li>
              <Link href="/entrar" className="hover:text-foreground">
                Entrar
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-foreground">Regulatório</h4>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            <li>Duplicata escritural — Lei 13.775/2018</li>
            <li>Trava B3 — Res. BC 4.734/2019</li>
            <li>FIDC — Res. CVM 175</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border/60 py-6">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-6 text-xs text-muted-foreground md:flex-row">
          <p>© {new Date().getFullYear()} AceitoFiado — todos os direitos reservados.</p>
          <p>Feito no AfroCapital Hack — instrumento financeiro de inclusão real.</p>
        </div>
      </div>
    </footer>
  );
}
