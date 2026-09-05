import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { SignInForm } from "@/components/auth/sign-in-form";
import { Container } from "@/components/ui/container";
import { isAuthConfigured, getVerifiedUser } from "@/lib/auth/supabase-server";
import { getSafeAuthRedirect } from "@/lib/auth/redirects";
import { brand } from "@/lib/brand";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { getLocalizedAlternates } from "@/lib/seo";

type SignInPageProps = {
  params: Promise<{ locale: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

type SignInCopy = {
  eyebrow: string;
  title: string;
  description: string;
  emailLabel: string;
  emailPlaceholder: string;
  codeLabel: string;
  codePlaceholder: string;
  sendCode: string;
  sendingCode: string;
  verifyCode: string;
  verifyingCode: string;
  codeSent: string;
  google: string;
  googleSigningIn: string;
  emailInstead: string;
  googleUnavailable: string;
  unavailableTitle: string;
  unavailableDescription: string;
  emailFallback: string;
  whatsappFallback: string;
  requirement: string;
  error: string;
};

export const dynamic = "force-dynamic";

const signInCopyByLocale: Record<Locale, SignInCopy> = {
  en: {
    eyebrow: "Customer account",
    title: "Sign in with Google or email for inquiry history and controlled downloads.",
    description: "Browsing, product search and draft inquiry lists stay available without sign-in.",
    emailLabel: "Work email",
    emailPlaceholder: "you@company.com",
    codeLabel: "Verification code",
    codePlaceholder: "Enter the email code",
    sendCode: "Send verification code",
    sendingCode: "Sending...",
    verifyCode: "Verify and continue",
    verifyingCode: "Verifying...",
    codeSent: "Check your email for the verification code, then enter it below.",
    google: "Continue with Google",
    googleSigningIn: "Opening Google...",
    emailInstead: "Use email instead",
    googleUnavailable: "Google sign-in is not configured on this environment. Use an email code to continue.",
    unavailableTitle: "Account login is not configured yet",
    unavailableDescription:
      "The website can still receive requirements by email or WhatsApp. Formal inquiry history and controlled downloads will be enabled after Supabase Auth is configured.",
    emailFallback: "Email requirements",
    whatsappFallback: "WhatsApp",
    requirement:
      "Use Google first when available, or verify a work email by code. A verified customer identity is required before formal submission history or controlled model-file access.",
    error: "Authentication failed. Please check the details and try again.",
  },
  de: {
    eyebrow: "Kundenkonto",
    title: "Melden Sie sich mit Google oder E-Mail fuer Anfragenverlauf und geschuetzte Downloads an.",
    description: "Produktrecherche und Entwurfslisten bleiben ohne Anmeldung verfuegbar.",
    emailLabel: "Geschäftliche E-Mail",
    emailPlaceholder: "sie@firma.com",
    codeLabel: "Bestaetigungscode",
    codePlaceholder: "Code aus der E-Mail eingeben",
    sendCode: "Code senden",
    sendingCode: "Wird gesendet...",
    verifyCode: "Bestaetigen und fortfahren",
    verifyingCode: "Wird geprueft...",
    codeSent: "Pruefen Sie Ihre E-Mail und geben Sie den Code unten ein.",
    google: "Mit Google fortfahren",
    googleSigningIn: "Google wird geoeffnet...",
    emailInstead: "E-Mail stattdessen nutzen",
    googleUnavailable: "Google-Anmeldung ist in dieser Umgebung nicht konfiguriert. Nutzen Sie einen E-Mail-Code.",
    unavailableTitle: "Kundenlogin ist noch nicht konfiguriert",
    unavailableDescription:
      "Sie koennen Anforderungen weiterhin per E-Mail oder WhatsApp senden. Anfrageverlauf und geschuetzte Downloads werden nach der Supabase-Auth-Konfiguration aktiviert.",
    emailFallback: "Anforderungen per E-Mail",
    whatsappFallback: "WhatsApp",
    requirement:
      "Nutzen Sie Google, wenn verfuegbar, oder bestaetigen Sie eine geschäftliche E-Mail per Code. Eine verifizierte Kundenidentitaet ist fuer Anfrageverlauf und geschuetzte Modelldateien erforderlich.",
    error: "Anmeldung fehlgeschlagen. Bitte pruefen Sie die Angaben und versuchen Sie es erneut.",
  },
  fr: {
    eyebrow: "Compte client",
    title: "Connectez-vous avec Google ou par e-mail pour l'historique et les telechargements controles.",
    description: "La recherche produit et les brouillons de demande restent disponibles sans connexion.",
    emailLabel: "E-mail professionnel",
    emailPlaceholder: "vous@entreprise.com",
    codeLabel: "Code de verification",
    codePlaceholder: "Saisir le code recu par e-mail",
    sendCode: "Envoyer le code",
    sendingCode: "Envoi...",
    verifyCode: "Verifier et continuer",
    verifyingCode: "Verification...",
    codeSent: "Consultez votre e-mail puis saisissez le code ci-dessous.",
    google: "Continuer avec Google",
    googleSigningIn: "Ouverture de Google...",
    emailInstead: "Utiliser l'e-mail a la place",
    googleUnavailable: "La connexion Google n'est pas configuree dans cet environnement. Utilisez un code e-mail.",
    unavailableTitle: "La connexion client n'est pas encore configuree",
    unavailableDescription:
      "Vous pouvez toujours envoyer vos besoins par e-mail ou WhatsApp. L'historique des demandes et les telechargements controles seront actives apres la configuration de Supabase Auth.",
    emailFallback: "Envoyer par e-mail",
    whatsappFallback: "WhatsApp",
    requirement:
      "Utilisez Google lorsqu'il est disponible, ou verifiez un e-mail professionnel par code. Une identite client verifiee est requise pour l'historique des demandes et l'acces aux fichiers controles.",
    error: "L'authentification a echoue. Verifiez les informations et reessayez.",
  },
  "zh-cn": {
    eyebrow: "客户账户",
    title: "使用 Google 或邮箱登录，查看询盘历史和受控下载。",
    description: "浏览产品、搜索型号和保存询盘草稿不强制登录。",
    emailLabel: "工作邮箱",
    emailPlaceholder: "you@company.com",
    codeLabel: "验证码",
    codePlaceholder: "输入邮件验证码",
    sendCode: "发送验证码",
    sendingCode: "发送中...",
    verifyCode: "验证并继续",
    verifyingCode: "验证中...",
    codeSent: "请查看邮箱验证码，然后在下方输入。",
    google: "使用 Google 继续",
    googleSigningIn: "正在打开 Google...",
    emailInstead: "改用邮箱",
    googleUnavailable: "当前环境尚未配置 Google 登录。请使用邮箱验证码继续。",
    unavailableTitle: "账户登录尚未配置",
    unavailableDescription:
      "网站仍可通过邮件或 WhatsApp 接收需求。Supabase Auth 配置完成后，再启用正式询盘历史和受控下载。",
    emailFallback: "邮件发送需求",
    whatsappFallback: "WhatsApp",
    requirement:
      "优先使用 Google 登录；也可以通过工作邮箱验证码登录。正式询盘历史和受控型号文件访问需要经过验证的客户身份。",
    error: "认证失败，请检查信息后重试。",
  },
  it: {
    eyebrow: "Account cliente",
    title: "Accedi con Google o e-mail per storico richieste e download controllati.",
    description: "Navigazione, ricerca prodotti e bozze richiesta restano disponibili senza accesso.",
    emailLabel: "E-mail aziendale",
    emailPlaceholder: "tu@azienda.com",
    codeLabel: "Codice di verifica",
    codePlaceholder: "Inserisci il codice e-mail",
    sendCode: "Invia codice",
    sendingCode: "Invio...",
    verifyCode: "Verifica e continua",
    verifyingCode: "Verifica...",
    codeSent: "Controlla l'e-mail e inserisci il codice qui sotto.",
    google: "Continua con Google",
    googleSigningIn: "Apertura Google...",
    emailInstead: "Usa e-mail invece",
    googleUnavailable: "L'accesso Google non e configurato in questo ambiente. Usa un codice e-mail.",
    unavailableTitle: "Login cliente non ancora configurato",
    unavailableDescription:
      "Puoi ancora inviare i requisiti via e-mail o WhatsApp. Storico richieste e download controllati saranno attivati dopo la configurazione di Supabase Auth.",
    emailFallback: "Invia requisiti",
    whatsappFallback: "WhatsApp",
    requirement:
      "Usa Google quando disponibile oppure verifica un'e-mail aziendale con un codice. Un'identita cliente verificata e richiesta per storico richieste e accesso ai file modello controllati.",
    error: "Autenticazione non riuscita. Controlla i dati e riprova.",
  },
};

export async function generateMetadata({ params }: SignInPageProps): Promise<Metadata> {
  const { locale: localeParam } = await params;

  if (!isLocale(localeParam)) {
    return {};
  }

  return {
    title: `${signInCopyByLocale[localeParam].eyebrow} | EKD`,
    description: signInCopyByLocale[localeParam].description,
    alternates: getLocalizedAlternates(localeParam, "/sign-in"),
  };
}

export default async function SignInPage({ params, searchParams }: SignInPageProps) {
  const { locale: localeParam } = await params;

  if (!isLocale(localeParam)) {
    notFound();
  }

  const locale = localeParam as Locale;
  const copy = signInCopyByLocale[locale];
  const resolvedSearchParams = (await searchParams) ?? {};
  const nextPath = getSafeAuthRedirect(resolvedSearchParams.next, locale);
  const verifiedUser = await getVerifiedUser();

  if (verifiedUser) {
    redirect(nextPath);
  }

  return (
    <Container className="py-10 md:py-12">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,0.85fr)_minmax(320px,0.65fr)] lg:items-start">
        <section className="border-t border-line pt-7">
          <p className="text-sm font-semibold text-accent-dark">{copy.eyebrow}</p>
          <h1 className="mt-4 max-w-3xl font-sans text-4xl font-semibold leading-tight text-ink md:text-5xl">
            {copy.title}
          </h1>
          <p className="mt-5 max-w-2xl text-sm leading-7 text-steel">{copy.description}</p>
        </section>
        <SignInForm
          copy={copy}
          nextPath={nextPath}
          authConfigured={isAuthConfigured()}
          googleEnabled={process.env.NEXT_PUBLIC_GOOGLE_AUTH_ENABLED === "true"}
          serviceEmail={brand.email}
          whatsappHref={brand.whatsapp.href}
        />
      </div>
    </Container>
  );
}
