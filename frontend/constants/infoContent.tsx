import React from "react";

export const infoContent: Record<string, React.ReactNode> = {
  "about": (
    <div className="space-y-1">
      <p className="mb-4 text-[13px] text-muted-foreground leading-relaxed" dangerouslySetInnerHTML={{__html: "BulkStoreInstaller is a simple and convenient way to install multiple Windows applications from one place."}}></p>
      <p className="mb-4 text-[13px] text-muted-foreground leading-relaxed" dangerouslySetInnerHTML={{__html: "Instead of visiting several websites and downloading each application separately, you can select the apps you need, add them to your cart, and begin the installation process together."}}></p>
      <p className="mb-4 text-[13px] text-muted-foreground leading-relaxed" dangerouslySetInnerHTML={{__html: "BulkStoreInstaller is designed especially for:"}}></p>
      <ul className="mb-4 space-y-2">
      <li className="relative pl-4 text-[13px] text-muted-foreground leading-relaxed before:content-[''] before:absolute before:left-0 before:top-[7px] before:w-1.5 before:h-1.5 before:bg-primary/40 before:rounded-full">{`Setting up a new Windows computer`}</li>
      <li className="relative pl-4 text-[13px] text-muted-foreground leading-relaxed before:content-[''] before:absolute before:left-0 before:top-[7px] before:w-1.5 before:h-1.5 before:bg-primary/40 before:rounded-full">{`Reinstalling essential applications`}</li>
      <li className="relative pl-4 text-[13px] text-muted-foreground leading-relaxed before:content-[''] before:absolute before:left-0 before:top-[7px] before:w-1.5 before:h-1.5 before:bg-primary/40 before:rounded-full">{`Students, developers, gamers, and professionals`}</li>
      <li className="relative pl-4 text-[13px] text-muted-foreground leading-relaxed before:content-[''] before:absolute before:left-0 before:top-[7px] before:w-1.5 before:h-1.5 before:bg-primary/40 before:rounded-full">{`Saving time during PC setup`}</li>
      </ul>
      <p className="mb-4 text-[13px] text-muted-foreground leading-relaxed" dangerouslySetInnerHTML={{__html: "The platform uses Windows Package Manager (Winget) to locate and install supported applications from trusted package sources."}}></p>
      <p className="mb-4 text-[13px] text-muted-foreground leading-relaxed" dangerouslySetInnerHTML={{__html: "Our goal is simple: make Windows application installation faster, cleaner, and easier."}}></p>
    </div>
  ),
  "disclaimer": (
    <div className="space-y-1">
      <p className="mb-4 text-[13px] text-muted-foreground leading-relaxed" dangerouslySetInnerHTML={{__html: "<strong className=\"text-foreground font-medium\">Last updated: August 26, 2026</strong>"}}></p>
      <p className="mb-4 text-[13px] text-muted-foreground leading-relaxed" dangerouslySetInnerHTML={{__html: "BulkStoreInstaller is provided as a convenience for discovering and installing Windows applications."}}></p>
      <h2 className="text-sm font-semibold text-foreground mt-6 mb-2">{`Third-Party Software`}</h2>
      <p className="mb-4 text-[13px] text-muted-foreground leading-relaxed" dangerouslySetInnerHTML={{__html: "BulkStoreInstaller does not develop, own, host, modify, or maintain the third-party applications listed on the website."}}></p>
      <p className="mb-4 text-[13px] text-muted-foreground leading-relaxed" dangerouslySetInnerHTML={{__html: "Application packages are obtained through Winget sources or the relevant application publisher. The availability, safety, accuracy, and behaviour of these packages are controlled by their respective providers."}}></p>
      <h2 className="text-sm font-semibold text-foreground mt-6 mb-2">{`No Affiliation or Endorsement`}</h2>
      <p className="mb-4 text-[13px] text-muted-foreground leading-relaxed" dangerouslySetInnerHTML={{__html: "The inclusion of an application does not imply a partnership, sponsorship, or endorsement between BulkStoreInstaller and its publisher."}}></p>
      <p className="mb-4 text-[13px] text-muted-foreground leading-relaxed" dangerouslySetInnerHTML={{__html: "Application names, icons, logos, and trademarks belong to their respective owners and are used only for identification."}}></p>
      <h2 className="text-sm font-semibold text-foreground mt-6 mb-2">{`No Installation Guarantee`}</h2>
      <p className="mb-4 text-[13px] text-muted-foreground leading-relaxed" dangerouslySetInnerHTML={{__html: "BulkStoreInstaller does not guarantee that:"}}></p>
      <ul className="mb-4 space-y-2">
      <li className="relative pl-4 text-[13px] text-muted-foreground leading-relaxed before:content-[''] before:absolute before:left-0 before:top-[7px] before:w-1.5 before:h-1.5 before:bg-primary/40 before:rounded-full">{`Every application will install successfully.`}</li>
      <li className="relative pl-4 text-[13px] text-muted-foreground leading-relaxed before:content-[''] before:absolute before:left-0 before:top-[7px] before:w-1.5 before:h-1.5 before:bg-primary/40 before:rounded-full">{`Applications will be free from errors or security risks.`}</li>
      <li className="relative pl-4 text-[13px] text-muted-foreground leading-relaxed before:content-[''] before:absolute before:left-0 before:top-[7px] before:w-1.5 before:h-1.5 before:bg-primary/40 before:rounded-full">{`Displayed versions or approximate sizes will always be accurate.`}</li>
      <li className="relative pl-4 text-[13px] text-muted-foreground leading-relaxed before:content-[''] before:absolute before:left-0 before:top-[7px] before:w-1.5 before:h-1.5 before:bg-primary/40 before:rounded-full">{`Applications will work correctly on every computer.`}</li>
      <li className="relative pl-4 text-[13px] text-muted-foreground leading-relaxed before:content-[''] before:absolute before:left-0 before:top-[7px] before:w-1.5 before:h-1.5 before:bg-primary/40 before:rounded-full">{`Packages will remain available through Winget.`}</li>
      </ul>
      <h2 className="text-sm font-semibold text-foreground mt-6 mb-2">{`Use at Your Own Risk`}</h2>
      <p className="mb-4 text-[13px] text-muted-foreground leading-relaxed" dangerouslySetInnerHTML={{__html: "You are responsible for reviewing your selections, checking publishers, reading installer prompts, and confirming system compatibility."}}></p>
      <p className="mb-4 text-[13px] text-muted-foreground leading-relaxed" dangerouslySetInnerHTML={{__html: "Installing or removing software can affect device settings, storage, performance, and existing data. Keep important files backed up and use updated security protection."}}></p>
      <h2 className="text-sm font-semibold text-foreground mt-6 mb-2">{`External Installers and Permissions`}</h2>
      <p className="mb-4 text-[13px] text-muted-foreground leading-relaxed" dangerouslySetInnerHTML={{__html: "Some applications may open their own installers or request administrator permission. Always verify the application and publisher before approving an administrator prompt."}}></p>
      <h2 className="text-sm font-semibold text-foreground mt-6 mb-2">{`Installation Cancellation`}</h2>
      <p className="mb-4 text-[13px] text-muted-foreground leading-relaxed" dangerouslySetInnerHTML={{__html: "Stopping BulkStoreInstaller may not stop an application that has already been passed to Winget or launched through an external installer."}}></p>
      <h2 className="text-sm font-semibold text-foreground mt-6 mb-2">{`Information Accuracy`}</h2>
      <p className="mb-4 text-[13px] text-muted-foreground leading-relaxed" dangerouslySetInnerHTML={{__html: "We aim to keep application details accurate, but versions, sizes, descriptions, links, and availability may change without notice."}}></p>
      <h2 className="text-sm font-semibold text-foreground mt-6 mb-2">{`No Warranties`}</h2>
      <p className="mb-4 text-[13px] text-muted-foreground leading-relaxed" dangerouslySetInnerHTML={{__html: "BulkStoreInstaller is provided on an “as available” basis without warranties regarding reliability, accuracy, compatibility, security, or uninterrupted availability."}}></p>
      <p className="mb-4 text-[13px] text-muted-foreground leading-relaxed" dangerouslySetInnerHTML={{__html: "By using BulkStoreInstaller, you acknowledge and accept the risks associated with downloading and installing third-party software."}}></p>
    </div>
  ),
  "how-it-works": (
    <div className="space-y-1">
      <p className="mb-4 text-[13px] text-muted-foreground leading-relaxed" dangerouslySetInnerHTML={{__html: "Installing applications with BulkStoreInstaller takes only a few steps."}}></p>
      <h2 className="text-sm font-semibold text-foreground mt-6 mb-2">{`1. Browse Applications`}</h2>
      <p className="mb-4 text-[13px] text-muted-foreground leading-relaxed" dangerouslySetInnerHTML={{__html: "Explore useful Windows applications organized into categories such as Browsers, Development, Communication, Media, Gaming, Utilities, and AI Tools."}}></p>
      <h2 className="text-sm font-semibold text-foreground mt-6 mb-2">{`2. Add Apps to Your Cart`}</h2>
      <p className="mb-4 text-[13px] text-muted-foreground leading-relaxed" dangerouslySetInnerHTML={{__html: "Select the applications you want and click <strong className=\"text-foreground font-medium\">Add to Cart</strong>. You can review or remove applications before starting."}}></p>
      <h2 className="text-sm font-semibold text-foreground mt-6 mb-2">{`3. Start Installation`}</h2>
      <p className="mb-4 text-[13px] text-muted-foreground leading-relaxed" dangerouslySetInnerHTML={{__html: "Click <strong className=\"text-foreground font-medium\">Install Apps</strong> to begin. BulkStoreInstaller sends your selected application list to the local installation system."}}></p>
      <h2 className="text-sm font-semibold text-foreground mt-6 mb-2">{`4. Follow the Progress`}</h2>
      <p className="mb-4 text-[13px] text-muted-foreground leading-relaxed" dangerouslySetInnerHTML={{__html: "The installation screen displays four stages:"}}></p>
      <ul className="mb-4 space-y-2">
      <li className="relative pl-4 text-[13px] text-muted-foreground leading-relaxed before:content-[''] before:absolute before:left-0 before:top-[7px] before:w-1.5 before:h-1.5 before:bg-primary/40 before:rounded-full">{`Preparing`}</li>
      <li className="relative pl-4 text-[13px] text-muted-foreground leading-relaxed before:content-[''] before:absolute before:left-0 before:top-[7px] before:w-1.5 before:h-1.5 before:bg-primary/40 before:rounded-full">{`Downloading`}</li>
      <li className="relative pl-4 text-[13px] text-muted-foreground leading-relaxed before:content-[''] before:absolute before:left-0 before:top-[7px] before:w-1.5 before:h-1.5 before:bg-primary/40 before:rounded-full">{`Installing`}</li>
      <li className="relative pl-4 text-[13px] text-muted-foreground leading-relaxed before:content-[''] before:absolute before:left-0 before:top-[7px] before:w-1.5 before:h-1.5 before:bg-primary/40 before:rounded-full">{`Verifying`}</li>
      </ul>
      <p className="mb-4 text-[13px] text-muted-foreground leading-relaxed" dangerouslySetInnerHTML={{__html: "Some applications may take a while depending on their size, your internet connection, and the installer provided by the application publisher."}}></p>
      <p className="mb-4 text-[13px] text-muted-foreground leading-relaxed" dangerouslySetInnerHTML={{__html: "You can continue browsing in another tab, but do not close the installation tab if you want to see the progress."}}></p>
      <h2 className="text-sm font-semibold text-foreground mt-6 mb-2">{`5. Installation Complete`}</h2>
      <p className="mb-4 text-[13px] text-muted-foreground leading-relaxed" dangerouslySetInnerHTML={{__html: "After Winget finishes processing the selected applications, BulkStoreInstaller displays the installation result for each app."}}></p>
      <p className="mb-4 text-[13px] text-muted-foreground leading-relaxed" dangerouslySetInnerHTML={{__html: "Some applications may request administrator permission or require you to restart your computer."}}></p>
    </div>
  ),
  "privacy": (
    <div className="space-y-1">
      <p className="mb-4 text-[13px] text-muted-foreground leading-relaxed" dangerouslySetInnerHTML={{__html: "<strong className=\"text-foreground font-medium\">Last updated: August 26, 2026</strong>"}}></p>
      <p className="mb-4 text-[13px] text-muted-foreground leading-relaxed" dangerouslySetInnerHTML={{__html: "BulkStoreInstaller respects your privacy. This policy explains what information may be processed when you use the website."}}></p>
      <h2 className="text-sm font-semibold text-foreground mt-6 mb-2">{`Information We Process`}</h2>
      <p className="mb-4 text-[13px] text-muted-foreground leading-relaxed" dangerouslySetInnerHTML={{__html: "BulkStoreInstaller does not require an account to browse applications or create an installation cart."}}></p>
      <p className="mb-4 text-[13px] text-muted-foreground leading-relaxed" dangerouslySetInnerHTML={{__html: "Your selected applications and installation progress may be processed locally in your browser or on your computer to provide the installation service."}}></p>
      <h2 className="text-sm font-semibold text-foreground mt-6 mb-2">{`Information You Provide`}</h2>
      <p className="mb-4 text-[13px] text-muted-foreground leading-relaxed" dangerouslySetInnerHTML={{__html: "If you submit a bug report, feedback message, or support request, we may receive the information you provide, such as:"}}></p>
      <ul className="mb-4 space-y-2">
      <li className="relative pl-4 text-[13px] text-muted-foreground leading-relaxed before:content-[''] before:absolute before:left-0 before:top-[7px] before:w-1.5 before:h-1.5 before:bg-primary/40 before:rounded-full">{`Your name or email address`}</li>
      <li className="relative pl-4 text-[13px] text-muted-foreground leading-relaxed before:content-[''] before:absolute before:left-0 before:top-[7px] before:w-1.5 before:h-1.5 before:bg-primary/40 before:rounded-full">{`The details of your message`}</li>
      <li className="relative pl-4 text-[13px] text-muted-foreground leading-relaxed before:content-[''] before:absolute before:left-0 before:top-[7px] before:w-1.5 before:h-1.5 before:bg-primary/40 before:rounded-full">{`Technical information included in the report`}</li>
      </ul>
      <p className="mb-4 text-[13px] text-muted-foreground leading-relaxed" dangerouslySetInnerHTML={{__html: "This information is used only to review the issue, respond to you, and improve BulkStoreInstaller."}}></p>
      <h2 className="text-sm font-semibold text-foreground mt-6 mb-2">{`Technical and Hosting Information`}</h2>
      <p className="mb-4 text-[13px] text-muted-foreground leading-relaxed" dangerouslySetInnerHTML={{__html: "Our hosting provider may automatically process limited technical information, including your IP address, browser type, device information, access time, and requested pages. This information may be required for security, reliability, and service operation."}}></p>
      <h2 className="text-sm font-semibold text-foreground mt-6 mb-2">{`Local Storage`}</h2>
      <p className="mb-4 text-[13px] text-muted-foreground leading-relaxed" dangerouslySetInnerHTML={{__html: "BulkStoreInstaller may use browser storage to remember your cart, preferences, or installation state. You can clear this information through your browser settings."}}></p>
      <h2 className="text-sm font-semibold text-foreground mt-6 mb-2">{`Third-Party Services`}</h2>
      <p className="mb-4 text-[13px] text-muted-foreground leading-relaxed" dangerouslySetInnerHTML={{__html: "BulkStoreInstaller may interact with third-party services, including:"}}></p>
      <ul className="mb-4 space-y-2">
      <li className="relative pl-4 text-[13px] text-muted-foreground leading-relaxed before:content-[''] before:absolute before:left-0 before:top-[7px] before:w-1.5 before:h-1.5 before:bg-primary/40 before:rounded-full">{`Microsoft Winget`}</li>
      <li className="relative pl-4 text-[13px] text-muted-foreground leading-relaxed before:content-[''] before:absolute before:left-0 before:top-[7px] before:w-1.5 before:h-1.5 before:bg-primary/40 before:rounded-full">{`Application publishers and download servers`}</li>
      <li className="relative pl-4 text-[13px] text-muted-foreground leading-relaxed before:content-[''] before:absolute before:left-0 before:top-[7px] before:w-1.5 before:h-1.5 before:bg-primary/40 before:rounded-full">{`Website hosting and infrastructure providers`}</li>
      <li className="relative pl-4 text-[13px] text-muted-foreground leading-relaxed before:content-[''] before:absolute before:left-0 before:top-[7px] before:w-1.5 before:h-1.5 before:bg-primary/40 before:rounded-full">{`External links included on the website`}</li>
      </ul>
      <p className="mb-4 text-[13px] text-muted-foreground leading-relaxed" dangerouslySetInnerHTML={{__html: "These services operate under their own privacy policies and terms. BulkStoreInstaller is not responsible for how third-party applications or services process your information."}}></p>
      <h2 className="text-sm font-semibold text-foreground mt-6 mb-2">{`Data Selling and Advertising`}</h2>
      <p className="mb-4 text-[13px] text-muted-foreground leading-relaxed" dangerouslySetInnerHTML={{__html: "BulkStoreInstaller does not sell your personal information. We do not use your installation selections for targeted advertising."}}></p>
      <h2 className="text-sm font-semibold text-foreground mt-6 mb-2">{`Data Security`}</h2>
      <p className="mb-4 text-[13px] text-muted-foreground leading-relaxed" dangerouslySetInnerHTML={{__html: "Reasonable measures are used to protect information submitted through the website. However, no online system or data-transfer method can be guaranteed to be completely secure."}}></p>
      <h2 className="text-sm font-semibold text-foreground mt-6 mb-2">{`Children’s Privacy`}</h2>
      <p className="mb-4 text-[13px] text-muted-foreground leading-relaxed" dangerouslySetInnerHTML={{__html: "BulkStoreInstaller is not designed to knowingly collect personal information from children under the age required by applicable law."}}></p>
      <h2 className="text-sm font-semibold text-foreground mt-6 mb-2">{`Changes to This Policy`}</h2>
      <p className="mb-4 text-[13px] text-muted-foreground leading-relaxed" dangerouslySetInnerHTML={{__html: "This Privacy Policy may be updated when the website, its features, or legal requirements change. The latest version will always be published on this page with its updated date."}}></p>
      <h2 className="text-sm font-semibold text-foreground mt-6 mb-2">{`Contact`}</h2>
      <p className="mb-4 text-[13px] text-muted-foreground leading-relaxed" dangerouslySetInnerHTML={{__html: "If you have questions about this Privacy Policy, contact us through the support or report option available on the BulkStoreInstaller website."}}></p>
    </div>
  ),
  "safety": (
    <div className="space-y-1">
      <p className="mb-4 text-[13px] text-muted-foreground leading-relaxed" dangerouslySetInnerHTML={{__html: "BulkStoreInstaller is designed to provide a transparent and secure application-installation experience."}}></p>
      <h2 className="text-sm font-semibold text-foreground mt-6 mb-2">{`Uses Windows Package Manager`}</h2>
      <p className="mb-4 text-[13px] text-muted-foreground leading-relaxed" dangerouslySetInnerHTML={{__html: "Applications are installed using Winget, Microsoft’s Windows Package Manager. Winget retrieves packages from the sources configured on your computer."}}></p>
      <h2 className="text-sm font-semibold text-foreground mt-6 mb-2">{`You Control What Gets Installed`}</h2>
      <p className="mb-4 text-[13px] text-muted-foreground leading-relaxed" dangerouslySetInnerHTML={{__html: "BulkStoreInstaller installs only the applications you select. Always review your cart before beginning the installation."}}></p>
      <h2 className="text-sm font-semibold text-foreground mt-6 mb-2">{`Administrator Permission`}</h2>
      <p className="mb-4 text-[13px] text-muted-foreground leading-relaxed" dangerouslySetInnerHTML={{__html: "Some applications may require administrator access. Windows may display a User Account Control confirmation before allowing the installation to continue."}}></p>
      <p className="mb-4 text-[13px] text-muted-foreground leading-relaxed" dangerouslySetInnerHTML={{__html: "Always verify the application name and publisher before approving the request."}}></p>
      <h2 className="text-sm font-semibold text-foreground mt-6 mb-2">{`Third-Party Applications`}</h2>
      <p className="mb-4 text-[13px] text-muted-foreground leading-relaxed" dangerouslySetInnerHTML={{__html: "BulkStoreInstaller does not develop or control the applications listed on the platform. Each application belongs to its respective developer or publisher and is subject to its own licence, privacy policy, and terms."}}></p>
      <h2 className="text-sm font-semibold text-foreground mt-6 mb-2">{`Installation Cancellation`}</h2>
      <p className="mb-4 text-[13px] text-muted-foreground leading-relaxed" dangerouslySetInnerHTML={{__html: "Selecting <strong className=\"text-foreground font-medium\">Stop Installation</strong> stops BulkStoreInstaller from starting additional applications. However, an application already passed to Winget or its external installer may continue until it finishes or is manually closed."}}></p>
      <h2 className="text-sm font-semibold text-foreground mt-6 mb-2">{`Safety Recommendations`}</h2>
      <ul className="mb-4 space-y-2">
      <li className="relative pl-4 text-[13px] text-muted-foreground leading-relaxed before:content-[''] before:absolute before:left-0 before:top-[7px] before:w-1.5 before:h-1.5 before:bg-primary/40 before:rounded-full">{`Keep Windows and Winget updated.`}</li>
      <li className="relative pl-4 text-[13px] text-muted-foreground leading-relaxed before:content-[''] before:absolute before:left-0 before:top-[7px] before:w-1.5 before:h-1.5 before:bg-primary/40 before:rounded-full">{`Review every application before installing it.`}</li>
      <li className="relative pl-4 text-[13px] text-muted-foreground leading-relaxed before:content-[''] before:absolute before:left-0 before:top-[7px] before:w-1.5 before:h-1.5 before:bg-primary/40 before:rounded-full">{`Download software only from trusted sources.`}</li>
      <li className="relative pl-4 text-[13px] text-muted-foreground leading-relaxed before:content-[''] before:absolute before:left-0 before:top-[7px] before:w-1.5 before:h-1.5 before:bg-primary/40 before:rounded-full">{`Check the publisher shown in administrator prompts.`}</li>
      <li className="relative pl-4 text-[13px] text-muted-foreground leading-relaxed before:content-[''] before:absolute before:left-0 before:top-[7px] before:w-1.5 before:h-1.5 before:bg-primary/40 before:rounded-full">{`Use updated antivirus protection.`}</li>
      </ul>
      <p className="mb-4 text-[13px] text-muted-foreground leading-relaxed" dangerouslySetInnerHTML={{__html: "BulkStoreInstaller does not modify application packages or guarantee the security, availability, or continued compatibility of third-party software."}}></p>
    </div>
  ),
  "terms": (
    <div className="space-y-1">
      <p className="mb-4 text-[13px] text-muted-foreground leading-relaxed" dangerouslySetInnerHTML={{__html: "<strong className=\"text-foreground font-medium\">Last updated: August 26, 2026</strong>"}}></p>
      <p className="mb-4 text-[13px] text-muted-foreground leading-relaxed" dangerouslySetInnerHTML={{__html: "Welcome to BulkStoreInstaller. By accessing or using this website, you agree to these Terms of Use. If you do not agree, please stop using the service."}}></p>
      <h2 className="text-sm font-semibold text-foreground mt-6 mb-2">{`1. Service Description`}</h2>
      <p className="mb-4 text-[13px] text-muted-foreground leading-relaxed" dangerouslySetInnerHTML={{__html: "BulkStoreInstaller helps users discover, select, and install multiple Windows applications. Supported applications may be installed using Microsoft Winget and other local installation methods."}}></p>
      <h2 className="text-sm font-semibold text-foreground mt-6 mb-2">{`2. User Responsibilities`}</h2>
      <p className="mb-4 text-[13px] text-muted-foreground leading-relaxed" dangerouslySetInnerHTML={{__html: "By using BulkStoreInstaller, you agree to:"}}></p>
      <ul className="mb-4 space-y-2">
      <li className="relative pl-4 text-[13px] text-muted-foreground leading-relaxed before:content-[''] before:absolute before:left-0 before:top-[7px] before:w-1.5 before:h-1.5 before:bg-primary/40 before:rounded-full">{`Review applications before installing them.`}</li>
      <li className="relative pl-4 text-[13px] text-muted-foreground leading-relaxed before:content-[''] before:absolute before:left-0 before:top-[7px] before:w-1.5 before:h-1.5 before:bg-primary/40 before:rounded-full">{`Confirm that your device meets each application’s requirements.`}</li>
      <li className="relative pl-4 text-[13px] text-muted-foreground leading-relaxed before:content-[''] before:absolute before:left-0 before:top-[7px] before:w-1.5 before:h-1.5 before:bg-primary/40 before:rounded-full">{`Read any permission or administrator prompts carefully.`}</li>
      <li className="relative pl-4 text-[13px] text-muted-foreground leading-relaxed before:content-[''] before:absolute before:left-0 before:top-[7px] before:w-1.5 before:h-1.5 before:bg-primary/40 before:rounded-full">{`Comply with the licences and terms of third-party applications.`}</li>
      <li className="relative pl-4 text-[13px] text-muted-foreground leading-relaxed before:content-[''] before:absolute before:left-0 before:top-[7px] before:w-1.5 before:h-1.5 before:bg-primary/40 before:rounded-full">{`Maintain appropriate backups and security protection.`}</li>
      </ul>
      <p className="mb-4 text-[13px] text-muted-foreground leading-relaxed" dangerouslySetInnerHTML={{__html: "You are responsible for the applications you select and install."}}></p>
      <h2 className="text-sm font-semibold text-foreground mt-6 mb-2">{`3. Third-Party Applications`}</h2>
      <p className="mb-4 text-[13px] text-muted-foreground leading-relaxed" dangerouslySetInnerHTML={{__html: "Applications listed on BulkStoreInstaller are owned and maintained by their respective developers or publishers."}}></p>
      <p className="mb-4 text-[13px] text-muted-foreground leading-relaxed" dangerouslySetInnerHTML={{__html: "BulkStoreInstaller does not control their:"}}></p>
      <ul className="mb-4 space-y-2">
      <li className="relative pl-4 text-[13px] text-muted-foreground leading-relaxed before:content-[''] before:absolute before:left-0 before:top-[7px] before:w-1.5 before:h-1.5 before:bg-primary/40 before:rounded-full">{`Installation packages`}</li>
      <li className="relative pl-4 text-[13px] text-muted-foreground leading-relaxed before:content-[''] before:absolute before:left-0 before:top-[7px] before:w-1.5 before:h-1.5 before:bg-primary/40 before:rounded-full">{`Features or performance`}</li>
      <li className="relative pl-4 text-[13px] text-muted-foreground leading-relaxed before:content-[''] before:absolute before:left-0 before:top-[7px] before:w-1.5 before:h-1.5 before:bg-primary/40 before:rounded-full">{`Privacy practices`}</li>
      <li className="relative pl-4 text-[13px] text-muted-foreground leading-relaxed before:content-[''] before:absolute before:left-0 before:top-[7px] before:w-1.5 before:h-1.5 before:bg-primary/40 before:rounded-full">{`Licences or pricing`}</li>
      <li className="relative pl-4 text-[13px] text-muted-foreground leading-relaxed before:content-[''] before:absolute before:left-0 before:top-[7px] before:w-1.5 before:h-1.5 before:bg-primary/40 before:rounded-full">{`Updates or continued availability`}</li>
      </ul>
      <p className="mb-4 text-[13px] text-muted-foreground leading-relaxed" dangerouslySetInnerHTML={{__html: "Listing an application does not represent ownership, sponsorship, partnership, or endorsement."}}></p>
      <h2 className="text-sm font-semibold text-foreground mt-6 mb-2">{`4. Administrator Permission`}</h2>
      <p className="mb-4 text-[13px] text-muted-foreground leading-relaxed" dangerouslySetInnerHTML={{__html: "Some installations may require administrator access. You are responsible for reviewing and approving any permission request displayed by Windows or a third-party installer."}}></p>
      <h2 className="text-sm font-semibold text-foreground mt-6 mb-2">{`5. Acceptable Use`}</h2>
      <p className="mb-4 text-[13px] text-muted-foreground leading-relaxed" dangerouslySetInnerHTML={{__html: "You must not:"}}></p>
      <ul className="mb-4 space-y-2">
      <li className="relative pl-4 text-[13px] text-muted-foreground leading-relaxed before:content-[''] before:absolute before:left-0 before:top-[7px] before:w-1.5 before:h-1.5 before:bg-primary/40 before:rounded-full">{`Use the service for unlawful purposes.`}</li>
      <li className="relative pl-4 text-[13px] text-muted-foreground leading-relaxed before:content-[''] before:absolute before:left-0 before:top-[7px] before:w-1.5 before:h-1.5 before:bg-primary/40 before:rounded-full">{`Attempt to damage or disrupt the website.`}</li>
      <li className="relative pl-4 text-[13px] text-muted-foreground leading-relaxed before:content-[''] before:absolute before:left-0 before:top-[7px] before:w-1.5 before:h-1.5 before:bg-primary/40 before:rounded-full">{`Bypass security protections or access restrictions.`}</li>
      <li className="relative pl-4 text-[13px] text-muted-foreground leading-relaxed before:content-[''] before:absolute before:left-0 before:top-[7px] before:w-1.5 before:h-1.5 before:bg-primary/40 before:rounded-full">{`Submit malicious files, code, or false reports.`}</li>
      <li className="relative pl-4 text-[13px] text-muted-foreground leading-relaxed before:content-[''] before:absolute before:left-0 before:top-[7px] before:w-1.5 before:h-1.5 before:bg-primary/40 before:rounded-full">{`Misrepresent BulkStoreInstaller as your own service.`}</li>
      <li className="relative pl-4 text-[13px] text-muted-foreground leading-relaxed before:content-[''] before:absolute before:left-0 before:top-[7px] before:w-1.5 before:h-1.5 before:bg-primary/40 before:rounded-full">{`Use automated systems that place an unreasonable load on the website.`}</li>
      </ul>
      <h2 className="text-sm font-semibold text-foreground mt-6 mb-2">{`6. Installation Results`}</h2>
      <p className="mb-4 text-[13px] text-muted-foreground leading-relaxed" dangerouslySetInnerHTML={{__html: "Installation results may vary depending on your internet connection, Windows version, system configuration, Winget sources, and the third-party installer."}}></p>
      <p className="mb-4 text-[13px] text-muted-foreground leading-relaxed" dangerouslySetInnerHTML={{__html: "BulkStoreInstaller does not guarantee that every installation will complete successfully."}}></p>
      <h2 className="text-sm font-semibold text-foreground mt-6 mb-2">{`7. Stopping an Installation`}</h2>
      <p className="mb-4 text-[13px] text-muted-foreground leading-relaxed" dangerouslySetInnerHTML={{__html: "Selecting <strong className=\"text-foreground font-medium\">Stop Installation</strong> prevents additional applications from being started where possible. An application already passed to Winget or another installer may continue running and may need to be closed manually."}}></p>
      <h2 className="text-sm font-semibold text-foreground mt-6 mb-2">{`8. Intellectual Property`}</h2>
      <p className="mb-4 text-[13px] text-muted-foreground leading-relaxed" dangerouslySetInnerHTML={{__html: "The BulkStoreInstaller name, original design, website content, and source code are protected by applicable intellectual-property laws unless stated otherwise."}}></p>
      <p className="mb-4 text-[13px] text-muted-foreground leading-relaxed" dangerouslySetInnerHTML={{__html: "Application names, logos, and trademarks belong to their respective owners and are displayed only for identification purposes."}}></p>
      <h2 className="text-sm font-semibold text-foreground mt-6 mb-2">{`9. Service Availability`}</h2>
      <p className="mb-4 text-[13px] text-muted-foreground leading-relaxed" dangerouslySetInnerHTML={{__html: "BulkStoreInstaller may be updated, modified, suspended, or discontinued at any time. Features and application listings may change without prior notice."}}></p>
      <h2 className="text-sm font-semibold text-foreground mt-6 mb-2">{`10. Limitation of Liability`}</h2>
      <p className="mb-4 text-[13px] text-muted-foreground leading-relaxed" dangerouslySetInnerHTML={{__html: "To the maximum extent permitted by applicable law, BulkStoreInstaller and its developer will not be liable for software issues, data loss, system damage, security incidents, failed installations, or other losses resulting from the use of third-party applications or installation tools."}}></p>
      <h2 className="text-sm font-semibold text-foreground mt-6 mb-2">{`11. Changes to These Terms`}</h2>
      <p className="mb-4 text-[13px] text-muted-foreground leading-relaxed" dangerouslySetInnerHTML={{__html: "These Terms may be updated when the service or legal requirements change. Continued use after an update means that you accept the revised Terms."}}></p>
      <h2 className="text-sm font-semibold text-foreground mt-6 mb-2">{`12. Contact`}</h2>
      <p className="mb-4 text-[13px] text-muted-foreground leading-relaxed" dangerouslySetInnerHTML={{__html: "For questions, feedback, or reports, use the support or <strong className=\"text-foreground font-medium\">Report Issue</strong> option available on the BulkStoreInstaller website."}}></p>
    </div>
  )
};

export const infoTitles: Record<string, string> = {'about': 'About Us', 'disclaimer': 'Disclaimer', 'how-it-works': 'How It Works', 'privacy': 'Privacy Policy', 'safety': 'Safety', 'terms': 'Terms of Use'};
