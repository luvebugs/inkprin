var _a;
import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { PassThrough } from "stream";
import { renderToPipeableStream } from "react-dom/server";
import { ServerRouter, UNSAFE_withComponentProps, Meta, Links, Outlet, ScrollRestoration, Scripts, useLoaderData, useActionData, Form, redirect, UNSAFE_withErrorBoundaryProps, useRouteError, useSubmit, useNavigation } from "react-router";
import { createReadableStreamFromReadable } from "@react-router/node";
import { isbot } from "isbot";
import "@shopify/shopify-app-react-router/adapters/node";
import { shopifyApp, AppDistribution, ApiVersion, LoginErrorType, boundary } from "@shopify/shopify-app-react-router/server";
import { PrismaSessionStorage } from "@shopify/shopify-app-session-storage-prisma";
import { PrismaClient } from "@prisma/client";
import { AppProvider } from "@shopify/shopify-app-react-router/react";
import * as React from "react";
import { useState, useRef, useEffect, useCallback } from "react";
import { AppProvider as AppProvider$1, Modal, DropZone, LegacyStack, Thumbnail, Text, Page, Layout, Card, BlockStack } from "@shopify/polaris";
import { NoteIcon, PersonIcon, MagicIcon, XIcon } from "@shopify/polaris-icons";
if (process.env.NODE_ENV !== "production") {
  if (!global.prismaGlobal) {
    global.prismaGlobal = new PrismaClient();
  }
}
const prisma = global.prismaGlobal ?? new PrismaClient();
const shopify = shopifyApp({
  apiKey: process.env.SHOPIFY_API_KEY,
  apiSecretKey: process.env.SHOPIFY_API_SECRET || "",
  apiVersion: ApiVersion.October25,
  scopes: (_a = process.env.SCOPES) == null ? void 0 : _a.split(","),
  appUrl: process.env.SHOPIFY_APP_URL || "",
  authPathPrefix: "/auth",
  sessionStorage: new PrismaSessionStorage(prisma),
  distribution: AppDistribution.AppStore,
  ...process.env.SHOP_CUSTOM_DOMAIN ? { customShopDomains: [process.env.SHOP_CUSTOM_DOMAIN] } : {}
});
ApiVersion.October25;
const addDocumentResponseHeaders = shopify.addDocumentResponseHeaders;
const authenticate = shopify.authenticate;
shopify.unauthenticated;
const login = shopify.login;
shopify.registerWebhooks;
shopify.sessionStorage;
const streamTimeout = 5e3;
async function handleRequest(request, responseStatusCode, responseHeaders, reactRouterContext) {
  addDocumentResponseHeaders(request, responseHeaders);
  const userAgent = request.headers.get("user-agent");
  const callbackName = isbot(userAgent ?? "") ? "onAllReady" : "onShellReady";
  return new Promise((resolve, reject) => {
    const { pipe, abort } = renderToPipeableStream(
      /* @__PURE__ */ jsx(
        ServerRouter,
        {
          context: reactRouterContext,
          url: request.url
        }
      ),
      {
        [callbackName]: () => {
          const body = new PassThrough();
          const stream = createReadableStreamFromReadable(body);
          responseHeaders.set("Content-Type", "text/html");
          resolve(
            new Response(stream, {
              headers: responseHeaders,
              status: responseStatusCode
            })
          );
          pipe(body);
        },
        onShellError(error) {
          reject(error);
        },
        onError(error) {
          responseStatusCode = 500;
          console.error(error);
        }
      }
    );
    setTimeout(abort, streamTimeout + 1e3);
  });
}
const entryServer = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: handleRequest,
  streamTimeout
}, Symbol.toStringTag, { value: "Module" }));
const root = UNSAFE_withComponentProps(function App() {
  return /* @__PURE__ */ jsxs("html", {
    lang: "en",
    children: [/* @__PURE__ */ jsxs("head", {
      children: [/* @__PURE__ */ jsx("meta", {
        charSet: "utf-8"
      }), /* @__PURE__ */ jsx("meta", {
        name: "viewport",
        content: "width=device-width,initial-scale=1"
      }), /* @__PURE__ */ jsx("link", {
        rel: "preconnect",
        href: "https://cdn.shopify.com/"
      }), /* @__PURE__ */ jsx("link", {
        rel: "preconnect",
        href: "https://fonts.googleapis.com"
      }), /* @__PURE__ */ jsx("link", {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossOrigin: "anonymous"
      }), /* @__PURE__ */ jsx("link", {
        href: "https://fonts.googleapis.com/css2?family=Jost:ital,wght@0,100..900;1,100..900&display=swap",
        rel: "stylesheet"
      }), /* @__PURE__ */ jsx("link", {
        rel: "stylesheet",
        href: "https://cdn.shopify.com/static/fonts/inter/v4/styles.css"
      }), /* @__PURE__ */ jsx(Meta, {}), /* @__PURE__ */ jsx(Links, {})]
    }), /* @__PURE__ */ jsxs("body", {
      className: "font-sans",
      children: [/* @__PURE__ */ jsx(Outlet, {}), /* @__PURE__ */ jsx(ScrollRestoration, {}), /* @__PURE__ */ jsx(Scripts, {})]
    })]
  });
});
const route0 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: root
}, Symbol.toStringTag, { value: "Module" }));
const action$4 = async ({
  request
}) => {
  const {
    payload,
    session,
    topic,
    shop
  } = await authenticate.webhook(request);
  console.log(`Received ${topic} webhook for ${shop}`);
  const current = payload.current;
  if (session) {
    await prisma.session.update({
      where: {
        id: session.id
      },
      data: {
        scope: current.toString()
      }
    });
  }
  return new Response();
};
const route1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  action: action$4
}, Symbol.toStringTag, { value: "Module" }));
const action$3 = async ({
  request
}) => {
  const {
    shop,
    session,
    topic
  } = await authenticate.webhook(request);
  console.log(`Received ${topic} webhook for ${shop}`);
  if (session) {
    await prisma.session.deleteMany({
      where: {
        shop
      }
    });
  }
  return new Response();
};
const route2 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  action: action$3
}, Symbol.toStringTag, { value: "Module" }));
const action$2 = async ({
  request
}) => {
  var _a2, _b, _c;
  await authenticate.admin(request);
  if (request.method !== "POST") {
    return Response.json({
      error: "Method not allowed"
    }, {
      status: 405
    });
  }
  try {
    const formData = await request.formData();
    const prompt = formData.get("prompt");
    const style = formData.get("style");
    const images = formData.getAll("images");
    if (!prompt || prompt.trim().length === 0) {
      return Response.json({
        error: "Prompt is required"
      }, {
        status: 400
      });
    }
    const apiKey = process.env.NANO_API_KEY || process.env.GEMINI_API_KEY || "sk-DcH56GrxD1uWnE6p44bPOuwzZfzVY9OoipViTDZIN6wrjq0D";
    const baseUrl = (process.env.NANO_API_URL || "https://nano.zhihuiapi.top").replace(/\/$/, "");
    const apiUrl = `${baseUrl}/v1beta/models/gemini-2.5-flash-image:generateContent`;
    if (!apiKey) ;
    const enhancedPrompt = `${prompt}, ${style} tattoo style, high quality, detailed, professional tattoo design`;
    const parts = [{
      text: enhancedPrompt
    }];
    if (images && images.length > 0) {
      for (const file of images) {
        const arrayBuffer = await file.arrayBuffer();
        const base64 = Buffer.from(arrayBuffer).toString("base64");
        parts.push({
          inline_data: {
            mime_type: file.type || "image/png",
            data: base64
          }
        });
      }
    }
    const requestBody = {
      contents: [{
        role: "user",
        parts
      }]
    };
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify(requestBody)
    });
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Nano Banana Pro API error:", errorText);
      return Response.json({
        error: "Failed to generate tattoo design",
        details: errorText
      }, {
        status: response.status
      });
    }
    const result = await response.json();
    const partsResp = ((_c = (_b = (_a2 = result == null ? void 0 : result.candidates) == null ? void 0 : _a2[0]) == null ? void 0 : _b.content) == null ? void 0 : _c.parts) ?? [];
    let inline = null;
    for (const p of partsResp) {
      if ((p == null ? void 0 : p.inline_data) || (p == null ? void 0 : p.inlineData)) {
        inline = p.inline_data || p.inlineData;
        break;
      }
    }
    if (!(inline == null ? void 0 : inline.data)) {
      return Response.json({
        error: "No image data in response",
        details: JSON.stringify(result)
      }, {
        status: 500
      });
    }
    const mime = inline.mime_type || inline.mimeType || "image/png";
    const dataUri = `data:${mime};base64,${inline.data}`;
    return Response.json({
      success: true,
      imageUrl: void 0,
      imageData: dataUri,
      prompt: enhancedPrompt
    });
  } catch (error) {
    console.error("Error generating tattoo:", error);
    return Response.json({
      error: "Internal server error",
      details: error instanceof Error ? error.message : "Unknown error"
    }, {
      status: 500
    });
  }
};
const route3 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  action: action$2
}, Symbol.toStringTag, { value: "Module" }));
function loginErrorMessage(loginErrors) {
  if ((loginErrors == null ? void 0 : loginErrors.shop) === LoginErrorType.MissingShop) {
    return { shop: "Please enter your shop domain to log in" };
  } else if ((loginErrors == null ? void 0 : loginErrors.shop) === LoginErrorType.InvalidShop) {
    return { shop: "Please enter a valid shop domain to log in" };
  }
  return {};
}
const loader$4 = async ({
  request
}) => {
  const errors = loginErrorMessage(await login(request));
  return {
    errors
  };
};
const action$1 = async ({
  request
}) => {
  const errors = loginErrorMessage(await login(request));
  return {
    errors
  };
};
const route$2 = UNSAFE_withComponentProps(function Auth() {
  const loaderData = useLoaderData();
  const actionData = useActionData();
  const [shop, setShop] = useState("");
  const {
    errors
  } = actionData || loaderData;
  return /* @__PURE__ */ jsx(AppProvider, {
    embedded: false,
    children: /* @__PURE__ */ jsx("s-page", {
      children: /* @__PURE__ */ jsx(Form, {
        method: "post",
        children: /* @__PURE__ */ jsxs("s-section", {
          heading: "Log in",
          children: [/* @__PURE__ */ jsx("s-text-field", {
            name: "shop",
            label: "Shop domain",
            details: "example.myshopify.com",
            value: shop,
            onChange: (e) => setShop(e.currentTarget.value),
            autocomplete: "on",
            error: errors.shop
          }), /* @__PURE__ */ jsx("s-button", {
            type: "submit",
            children: "Log in"
          })]
        })
      })
    })
  });
});
const route4 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  action: action$1,
  default: route$2,
  loader: loader$4
}, Symbol.toStringTag, { value: "Module" }));
const index = "_index_12o3y_1";
const heading = "_heading_12o3y_11";
const text = "_text_12o3y_12";
const content = "_content_12o3y_22";
const form = "_form_12o3y_27";
const label = "_label_12o3y_35";
const input = "_input_12o3y_43";
const button = "_button_12o3y_47";
const list = "_list_12o3y_51";
const styles$1 = {
  index,
  heading,
  text,
  content,
  form,
  label,
  input,
  button,
  list
};
const loader$3 = async ({
  request
}) => {
  const url = new URL(request.url);
  if (url.searchParams.get("shop")) {
    throw redirect(`/app?${url.searchParams.toString()}`);
  }
  return {
    showForm: Boolean(login)
  };
};
const route$1 = UNSAFE_withComponentProps(function App2() {
  const {
    showForm
  } = useLoaderData();
  return /* @__PURE__ */ jsx("div", {
    className: styles$1.index,
    children: /* @__PURE__ */ jsxs("div", {
      className: styles$1.content,
      children: [/* @__PURE__ */ jsx("h1", {
        className: styles$1.heading,
        children: "A short heading about [your app]"
      }), /* @__PURE__ */ jsx("p", {
        className: styles$1.text,
        children: "A tagline about [your app] that describes your value proposition."
      }), showForm && /* @__PURE__ */ jsxs(Form, {
        className: styles$1.form,
        method: "post",
        action: "/auth/login",
        children: [/* @__PURE__ */ jsxs("label", {
          className: styles$1.label,
          children: [/* @__PURE__ */ jsx("span", {
            children: "Shop domain"
          }), /* @__PURE__ */ jsx("input", {
            className: styles$1.input,
            type: "text",
            name: "shop"
          }), /* @__PURE__ */ jsx("span", {
            children: "e.g: my-shop-domain.myshopify.com"
          })]
        }), /* @__PURE__ */ jsx("button", {
          className: styles$1.button,
          type: "submit",
          children: "Log in"
        })]
      }), /* @__PURE__ */ jsxs("ul", {
        className: styles$1.list,
        children: [/* @__PURE__ */ jsxs("li", {
          children: [/* @__PURE__ */ jsx("strong", {
            children: "Product feature"
          }), ". Some detail about your feature and its benefit to your customer."]
        }), /* @__PURE__ */ jsxs("li", {
          children: [/* @__PURE__ */ jsx("strong", {
            children: "Product feature"
          }), ". Some detail about your feature and its benefit to your customer."]
        }), /* @__PURE__ */ jsxs("li", {
          children: [/* @__PURE__ */ jsx("strong", {
            children: "Product feature"
          }), ". Some detail about your feature and its benefit to your customer."]
        })]
      })]
    })
  });
});
const route5 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: route$1,
  loader: loader$3
}, Symbol.toStringTag, { value: "Module" }));
const loader$2 = async ({
  request
}) => {
  await authenticate.admin(request);
  return null;
};
const headers$1 = (headersArgs) => {
  return boundary.headers(headersArgs);
};
const route6 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  headers: headers$1,
  loader: loader$2
}, Symbol.toStringTag, { value: "Module" }));
const Polaris = /* @__PURE__ */ JSON.parse('{"ActionMenu":{"Actions":{"moreActions":"More actions"},"RollupActions":{"rollupButton":"View actions"}},"ActionList":{"SearchField":{"clearButtonLabel":"Clear","search":"Search","placeholder":"Search actions"}},"Avatar":{"label":"Avatar","labelWithInitials":"Avatar with initials {initials}"},"Autocomplete":{"spinnerAccessibilityLabel":"Loading","ellipsis":"{content}…"},"Badge":{"PROGRESS_LABELS":{"incomplete":"Incomplete","partiallyComplete":"Partially complete","complete":"Complete"},"TONE_LABELS":{"info":"Info","success":"Success","warning":"Warning","critical":"Critical","attention":"Attention","new":"New","readOnly":"Read-only","enabled":"Enabled"},"progressAndTone":"{toneLabel} {progressLabel}"},"Banner":{"dismissButton":"Dismiss notification"},"Button":{"spinnerAccessibilityLabel":"Loading"},"Common":{"checkbox":"checkbox","undo":"Undo","cancel":"Cancel","clear":"Clear","close":"Close","submit":"Submit","more":"More"},"ContextualSaveBar":{"save":"Save","discard":"Discard"},"DataTable":{"sortAccessibilityLabel":"sort {direction} by","navAccessibilityLabel":"Scroll table {direction} one column","totalsRowHeading":"Totals","totalRowHeading":"Total"},"DatePicker":{"previousMonth":"Show previous month, {previousMonthName} {showPreviousYear}","nextMonth":"Show next month, {nextMonth} {nextYear}","today":"Today ","start":"Start of range","end":"End of range","months":{"january":"January","february":"February","march":"March","april":"April","may":"May","june":"June","july":"July","august":"August","september":"September","october":"October","november":"November","december":"December"},"days":{"monday":"Monday","tuesday":"Tuesday","wednesday":"Wednesday","thursday":"Thursday","friday":"Friday","saturday":"Saturday","sunday":"Sunday"},"daysAbbreviated":{"monday":"Mo","tuesday":"Tu","wednesday":"We","thursday":"Th","friday":"Fr","saturday":"Sa","sunday":"Su"}},"DiscardConfirmationModal":{"title":"Discard all unsaved changes","message":"If you discard changes, you’ll delete any edits you made since you last saved.","primaryAction":"Discard changes","secondaryAction":"Continue editing"},"DropZone":{"single":{"overlayTextFile":"Drop file to upload","overlayTextImage":"Drop image to upload","overlayTextVideo":"Drop video to upload","actionTitleFile":"Add file","actionTitleImage":"Add image","actionTitleVideo":"Add video","actionHintFile":"or drop file to upload","actionHintImage":"or drop image to upload","actionHintVideo":"or drop video to upload","labelFile":"Upload file","labelImage":"Upload image","labelVideo":"Upload video"},"allowMultiple":{"overlayTextFile":"Drop files to upload","overlayTextImage":"Drop images to upload","overlayTextVideo":"Drop videos to upload","actionTitleFile":"Add files","actionTitleImage":"Add images","actionTitleVideo":"Add videos","actionHintFile":"or drop files to upload","actionHintImage":"or drop images to upload","actionHintVideo":"or drop videos to upload","labelFile":"Upload files","labelImage":"Upload images","labelVideo":"Upload videos"},"errorOverlayTextFile":"File type is not valid","errorOverlayTextImage":"Image type is not valid","errorOverlayTextVideo":"Video type is not valid"},"EmptySearchResult":{"altText":"Empty search results"},"Frame":{"skipToContent":"Skip to content","navigationLabel":"Navigation","Navigation":{"closeMobileNavigationLabel":"Close navigation"}},"FullscreenBar":{"back":"Back","accessibilityLabel":"Exit fullscreen mode"},"Filters":{"moreFilters":"More filters","moreFiltersWithCount":"More filters ({count})","filter":"Filter {resourceName}","noFiltersApplied":"No filters applied","cancel":"Cancel","done":"Done","clearAllFilters":"Clear all filters","clear":"Clear","clearLabel":"Clear {filterName}","addFilter":"Add filter","clearFilters":"Clear all","searchInView":"in:{viewName}"},"FilterPill":{"clear":"Clear","unsavedChanges":"Unsaved changes - {label}"},"IndexFilters":{"searchFilterTooltip":"Search and filter","searchFilterTooltipWithShortcut":"Search and filter (F)","searchFilterAccessibilityLabel":"Search and filter results","sort":"Sort your results","addView":"Add a new view","newView":"Custom search","SortButton":{"ariaLabel":"Sort the results","tooltip":"Sort","title":"Sort by","sorting":{"asc":"Ascending","desc":"Descending","az":"A-Z","za":"Z-A"}},"EditColumnsButton":{"tooltip":"Edit columns","accessibilityLabel":"Customize table column order and visibility"},"UpdateButtons":{"cancel":"Cancel","update":"Update","save":"Save","saveAs":"Save as","modal":{"title":"Save view as","label":"Name","sameName":"A view with this name already exists. Please choose a different name.","save":"Save","cancel":"Cancel"}}},"IndexProvider":{"defaultItemSingular":"Item","defaultItemPlural":"Items","allItemsSelected":"All {itemsLength}+ {resourceNamePlural} are selected","selected":"{selectedItemsCount} selected","a11yCheckboxDeselectAllSingle":"Deselect {resourceNameSingular}","a11yCheckboxSelectAllSingle":"Select {resourceNameSingular}","a11yCheckboxDeselectAllMultiple":"Deselect all {itemsLength} {resourceNamePlural}","a11yCheckboxSelectAllMultiple":"Select all {itemsLength} {resourceNamePlural}"},"IndexTable":{"emptySearchTitle":"No {resourceNamePlural} found","emptySearchDescription":"Try changing the filters or search term","onboardingBadgeText":"New","resourceLoadingAccessibilityLabel":"Loading {resourceNamePlural}…","selectAllLabel":"Select all {resourceNamePlural}","selected":"{selectedItemsCount} selected","undo":"Undo","selectAllItems":"Select all {itemsLength}+ {resourceNamePlural}","selectItem":"Select {resourceName}","selectButtonText":"Select","sortAccessibilityLabel":"sort {direction} by"},"Loading":{"label":"Page loading bar"},"Modal":{"iFrameTitle":"body markup","modalWarning":"These required properties are missing from Modal: {missingProps}"},"Page":{"Header":{"rollupActionsLabel":"View actions for {title}","pageReadyAccessibilityLabel":"{title}. This page is ready"}},"Pagination":{"previous":"Previous","next":"Next","pagination":"Pagination"},"ProgressBar":{"negativeWarningMessage":"Values passed to the progress prop shouldn’t be negative. Resetting {progress} to 0.","exceedWarningMessage":"Values passed to the progress prop shouldn’t exceed 100. Setting {progress} to 100."},"ResourceList":{"sortingLabel":"Sort by","defaultItemSingular":"item","defaultItemPlural":"items","showing":"Showing {itemsCount} {resource}","showingTotalCount":"Showing {itemsCount} of {totalItemsCount} {resource}","loading":"Loading {resource}","selected":"{selectedItemsCount} selected","allItemsSelected":"All {itemsLength}+ {resourceNamePlural} in your store are selected","allFilteredItemsSelected":"All {itemsLength}+ {resourceNamePlural} in this filter are selected","selectAllItems":"Select all {itemsLength}+ {resourceNamePlural} in your store","selectAllFilteredItems":"Select all {itemsLength}+ {resourceNamePlural} in this filter","emptySearchResultTitle":"No {resourceNamePlural} found","emptySearchResultDescription":"Try changing the filters or search term","selectButtonText":"Select","a11yCheckboxDeselectAllSingle":"Deselect {resourceNameSingular}","a11yCheckboxSelectAllSingle":"Select {resourceNameSingular}","a11yCheckboxDeselectAllMultiple":"Deselect all {itemsLength} {resourceNamePlural}","a11yCheckboxSelectAllMultiple":"Select all {itemsLength} {resourceNamePlural}","Item":{"actionsDropdownLabel":"Actions for {accessibilityLabel}","actionsDropdown":"Actions dropdown","viewItem":"View details for {itemName}"},"BulkActions":{"actionsActivatorLabel":"Actions","moreActionsActivatorLabel":"More actions"}},"SkeletonPage":{"loadingLabel":"Page loading"},"Tabs":{"newViewAccessibilityLabel":"Create new view","newViewTooltip":"Create view","toggleTabsLabel":"More views","Tab":{"rename":"Rename view","duplicate":"Duplicate view","edit":"Edit view","editColumns":"Edit columns","delete":"Delete view","copy":"Copy of {name}","deleteModal":{"title":"Delete view?","description":"This can’t be undone. {viewName} view will no longer be available in your admin.","cancel":"Cancel","delete":"Delete view"}},"RenameModal":{"title":"Rename view","label":"Name","cancel":"Cancel","create":"Save","errors":{"sameName":"A view with this name already exists. Please choose a different name."}},"DuplicateModal":{"title":"Duplicate view","label":"Name","cancel":"Cancel","create":"Create view","errors":{"sameName":"A view with this name already exists. Please choose a different name."}},"CreateViewModal":{"title":"Create new view","label":"Name","cancel":"Cancel","create":"Create view","errors":{"sameName":"A view with this name already exists. Please choose a different name."}}},"Tag":{"ariaLabel":"Remove {children}"},"TextField":{"characterCount":"{count} characters","characterCountWithMaxLength":"{count} of {limit} characters used"},"TooltipOverlay":{"accessibilityLabel":"Tooltip: {label}"},"TopBar":{"toggleMenuLabel":"Toggle menu","SearchField":{"clearButtonLabel":"Clear","search":"Search"}},"MediaCard":{"dismissButton":"Dismiss","popoverButton":"Actions"},"VideoThumbnail":{"playButtonA11yLabel":{"default":"Play video","defaultWithDuration":"Play video of length {duration}","duration":{"hours":{"other":{"only":"{hourCount} hours","andMinutes":"{hourCount} hours and {minuteCount} minutes","andMinute":"{hourCount} hours and {minuteCount} minute","minutesAndSeconds":"{hourCount} hours, {minuteCount} minutes, and {secondCount} seconds","minutesAndSecond":"{hourCount} hours, {minuteCount} minutes, and {secondCount} second","minuteAndSeconds":"{hourCount} hours, {minuteCount} minute, and {secondCount} seconds","minuteAndSecond":"{hourCount} hours, {minuteCount} minute, and {secondCount} second","andSeconds":"{hourCount} hours and {secondCount} seconds","andSecond":"{hourCount} hours and {secondCount} second"},"one":{"only":"{hourCount} hour","andMinutes":"{hourCount} hour and {minuteCount} minutes","andMinute":"{hourCount} hour and {minuteCount} minute","minutesAndSeconds":"{hourCount} hour, {minuteCount} minutes, and {secondCount} seconds","minutesAndSecond":"{hourCount} hour, {minuteCount} minutes, and {secondCount} second","minuteAndSeconds":"{hourCount} hour, {minuteCount} minute, and {secondCount} seconds","minuteAndSecond":"{hourCount} hour, {minuteCount} minute, and {secondCount} second","andSeconds":"{hourCount} hour and {secondCount} seconds","andSecond":"{hourCount} hour and {secondCount} second"}},"minutes":{"other":{"only":"{minuteCount} minutes","andSeconds":"{minuteCount} minutes and {secondCount} seconds","andSecond":"{minuteCount} minutes and {secondCount} second"},"one":{"only":"{minuteCount} minute","andSeconds":"{minuteCount} minute and {secondCount} seconds","andSecond":"{minuteCount} minute and {secondCount} second"}},"seconds":{"other":"{secondCount} seconds","one":"{secondCount} second"}}}}}');
const polarisTranslations = {
  Polaris
};
const loader$1 = async ({
  request
}) => {
  await authenticate.admin(request);
  return {
    apiKey: process.env.SHOPIFY_API_KEY || ""
  };
};
const app = UNSAFE_withComponentProps(function App3() {
  const {
    apiKey
  } = useLoaderData();
  return /* @__PURE__ */ jsx(AppProvider, {
    embedded: true,
    apiKey,
    children: /* @__PURE__ */ jsxs(AppProvider$1, {
      i18n: polarisTranslations,
      children: [/* @__PURE__ */ jsxs("s-app-nav", {
        children: [/* @__PURE__ */ jsx("s-link", {
          href: "/app",
          children: "Home"
        }), /* @__PURE__ */ jsx("s-link", {
          href: "/app/additional",
          children: "Additional page"
        })]
      }), /* @__PURE__ */ jsx(Outlet, {})]
    })
  });
});
const ErrorBoundary = UNSAFE_withErrorBoundaryProps(function ErrorBoundary2() {
  return boundary.error(useRouteError());
});
const headers = (headersArgs) => {
  return boundary.headers(headersArgs);
};
const route7 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  ErrorBoundary,
  default: app,
  headers,
  loader: loader$1
}, Symbol.toStringTag, { value: "Module" }));
const app_additional = UNSAFE_withComponentProps(function AdditionalPage() {
  return /* @__PURE__ */ jsxs("s-page", {
    heading: "Additional page",
    children: [/* @__PURE__ */ jsxs("s-section", {
      heading: "Multiple pages",
      children: [/* @__PURE__ */ jsxs("s-paragraph", {
        children: ["The app template comes with an additional page which demonstrates how to create multiple pages within app navigation using", " ", /* @__PURE__ */ jsx("s-link", {
          href: "https://shopify.dev/docs/apps/tools/app-bridge",
          target: "_blank",
          children: "App Bridge"
        }), "."]
      }), /* @__PURE__ */ jsxs("s-paragraph", {
        children: ["To create your own page and have it show up in the app navigation, add a page inside ", /* @__PURE__ */ jsx("code", {
          children: "app/routes"
        }), ", and a link to it in the", " ", /* @__PURE__ */ jsx("code", {
          children: "<ui-nav-menu>"
        }), " component found in", " ", /* @__PURE__ */ jsx("code", {
          children: "app/routes/app.jsx"
        }), "."]
      })]
    }), /* @__PURE__ */ jsx("s-section", {
      slot: "aside",
      heading: "Resources",
      children: /* @__PURE__ */ jsx("s-unordered-list", {
        children: /* @__PURE__ */ jsx("s-list-item", {
          children: /* @__PURE__ */ jsx("s-link", {
            href: "https://shopify.dev/docs/apps/design-guidelines/navigation#app-nav",
            target: "_blank",
            children: "App nav best practices"
          })
        })
      })
    })]
  });
});
const route8 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: app_additional
}, Symbol.toStringTag, { value: "Module" }));
const DB_NAME = "TattooGeneratorDB";
const STORE_NAME = "images";
const UPLOAD_STORE_NAME = "uploaded_images";
const DB_VERSION = 2;
const openDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = (event) => {
      console.error("IndexedDB error:", event);
      reject("Could not open IndexedDB");
    };
    request.onsuccess = (event) => {
      resolve(event.target.result);
    };
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains(UPLOAD_STORE_NAME)) {
        db.createObjectStore(UPLOAD_STORE_NAME, { autoIncrement: true });
      }
    };
  });
};
const saveImageToDB = async (imageUrl, prompt, style) => {
  try {
    const db = await openDB();
    const transaction = db.transaction([STORE_NAME], "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    const item = {
      id: Date.now().toString(),
      // Unique ID based on timestamp
      url: imageUrl,
      timestamp: Date.now(),
      prompt,
      style
    };
    const request = store.add(item);
    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve();
      request.onerror = () => reject("Failed to save image");
    });
  } catch (error) {
    console.error("Error saving to IndexedDB:", error);
  }
};
const getAllImagesFromDB = async () => {
  try {
    const db = await openDB();
    const transaction = db.transaction([STORE_NAME], "readonly");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();
    return new Promise((resolve, reject) => {
      request.onsuccess = () => {
        const result = request.result;
        result.sort((a, b) => b.timestamp - a.timestamp);
        resolve(result);
      };
      request.onerror = () => reject("Failed to retrieve images");
    });
  } catch (error) {
    console.error("Error retrieving all images:", error);
    return [];
  }
};
function Header() {
  return /* @__PURE__ */ jsxs("div", { className: "text-center space-y-2", children: [
    /* @__PURE__ */ jsx("h1", { className: "text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600", children: "AI Tattoo Generator" }),
    /* @__PURE__ */ jsx("p", { className: "text-gray-500 text-lg", children: "Turn your ideas into unique tattoo designs in seconds" })
  ] });
}
const SvgSparkle = (props) => /* @__PURE__ */ React.createElement("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, xmlns: "http://www.w3.org/2000/svg", ...props }, /* @__PURE__ */ React.createElement("path", { d: "M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" }));
const SvgCheck = (props) => /* @__PURE__ */ React.createElement("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 3, xmlns: "http://www.w3.org/2000/svg", ...props }, /* @__PURE__ */ React.createElement("polyline", { points: "20 6 9 17 4 12" }));
const example1 = "/assets/example1-C-PyYQ2b.webp";
const example2 = "/assets/example2-C3foLocx.webp";
const example3 = "/assets/example3-D7I1VTPU.webp";
const example4 = "/assets/example4-UhACMeLJ.webp";
const example5 = "/assets/example5-Bd3jgHMp.webp";
const example6 = "/assets/example6-hJlJ5oZg.webp";
const example7 = "/assets/example7-CYtUVTdv.webp";
const example8 = "/assets/example8-D_iOCejI.webp";
const example9 = "/assets/example9--P1w_2sL.webp";
const example10 = "/assets/example10-DSY9XYMZ.webp";
const example11 = "/assets/example11-DxtSea6n.webp";
const styleImages = {
  "Ghibli": example1,
  "Couple": example2,
  "Creepy": example3,
  "Egypt": example4,
  "Paganic": example5,
  "Flame Design": example6,
  "Chicano": example7,
  "Monospace Text": example8,
  "Geometric": example9,
  "Spiritual": example10,
  "Dotwork": example11
};
const surprisePrompts = [
  "A detailed floral forearm piece with a compass in a black and grey style",
  "A geometric mandala design with intricate patterns and symmetry",
  "A watercolor-style dragon wrapped around the arm with vibrant colors",
  "A minimalist line art portrait of a wolf howling at the moon",
  "A traditional Japanese koi fish swimming upstream with cherry blossoms",
  "An abstract geometric design with bold black lines and negative space",
  "A realistic portrait tattoo with dramatic shading and depth",
  "A neo-traditional rose with bold colors and decorative elements"
];
const stylesList = [
  "No Style",
  "Ghibli",
  "Couple",
  "Creepy",
  "Egypt",
  "Paganic",
  "Flame Design",
  "Chicano",
  "Monospace Text",
  "Geometric",
  "Spiritual",
  "Dotwork"
];
function StyleSelector({ selectedStyle, setSelectedStyle }) {
  return /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsx("h3", { className: "text-lg font-semibold text-gray-900", children: "Select Style" }),
      /* @__PURE__ */ jsx("span", { className: "text-sm text-gray-500", children: selectedStyle })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "grid auto-cols-auto grid-flow-row gap-3 p-1", style: { grid: "auto / auto-flow max-content", overflow: "auto" }, children: stylesList.map((style) => {
      const isPro = ["Ghibli", "Couple", "Creepy", "Dotwork"].includes(style);
      const isSelected = selectedStyle === style;
      return /* @__PURE__ */ jsxs(
        "button",
        {
          className: `group relative flex flex-col items-center justify-center rounded-sm transition-all cursor-pointer aspect-square gap-2 ${isSelected ? "" : "bg-white"}`,
          onClick: () => setSelectedStyle(style),
          type: "button",
          children: [
            isPro && /* @__PURE__ */ jsx("div", { className: "absolute top-1 left-1 flex items-center gap-0.5 px-1.5 py-0.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-bold rounded-full shadow-sm z-10", children: /* @__PURE__ */ jsx("span", { children: "PRO" }) }),
            /* @__PURE__ */ jsxs("div", { className: `rounded-full overflow-hidden w-16 h-16 flex items-center justify-center transition-all ${isSelected ? "ring-2 ring-stone-500 shadow-md" : "bg-gray-100 group-hover:shadow-md"}`, children: [
              style === "No Style" ? /* @__PURE__ */ jsx("div", { className: `p-2 rounded-full transition-colors ${isSelected ? "bg-stone-100 text-stone-600" : "bg-gray-100 text-gray-500 group-hover:bg-white group-hover:text-indigo-500"}`, children: /* @__PURE__ */ jsx(SvgSparkle, { width: "24", height: "24" }) }) : /* @__PURE__ */ jsx(
                "img",
                {
                  src: styleImages[style],
                  alt: style,
                  className: "w-full h-full object-cover transform transition-transform duration-300 group-hover:scale-110"
                }
              ),
              isSelected && /* @__PURE__ */ jsx("div", { className: "absolute top-1 right-2 text-white bg-black rounded-full p-0.5 shadow-sm z-10", children: /* @__PURE__ */ jsx(SvgCheck, { width: "12", height: "12" }) })
            ] }),
            /* @__PURE__ */ jsx("span", { className: `text-xs text-center ${isSelected ? "text-indigo-900 font-medium" : "text-gray-600"}`, children: style })
          ]
        },
        style
      );
    }) })
  ] });
}
const SvgUpload = (props) => /* @__PURE__ */ React.createElement("svg", { width: 21, height: 21, viewBox: "0 0 21 20", fill: "none", stroke: "currentColor", xmlns: "http://www.w3.org/2000/svg", ...props }, /* @__PURE__ */ React.createElement("path", { d: "M6.5 2H8.5C9.03125 2 9.5 2.46875 9.5 3V6H5.5V3C5.5 2.46875 5.9375 2 6.5 2ZM2.5 10C2.5 8.34375 3.84375 7 5.5 7H9.5C11.1562 7 12.5 8.34375 12.5 10V16.5C12.5 17.3438 11.8125 18 11 18H4C3.15625 18 2.5 17.3438 2.5 16.5V10ZM10 12.5C10 11.625 9.5 10.8125 8.75 10.3438C7.96875 9.90625 7 9.90625 6.25 10.3438C5.46875 10.8125 5 11.625 5 12.5C5 13.4062 5.46875 14.2188 6.25 14.6875C7 15.125 7.96875 15.125 8.75 14.6875C9.5 14.2188 10 13.4062 10 12.5ZM10.5 4C10.5 3.46875 10.9375 3 11.5 3C12.0312 3 12.5 3.46875 12.5 4C12.5 4.5625 12.0312 5 11.5 5C10.9375 5 10.5 4.5625 10.5 4ZM14.5 3C15.0312 3 15.5 3.46875 15.5 4C15.5 4.5625 15.0312 5 14.5 5C13.9375 5 13.5 4.5625 13.5 4C13.5 3.46875 13.9375 3 14.5 3ZM16.5 4C16.5 3.46875 16.9375 3 17.5 3C18.0312 3 18.5 3.46875 18.5 4C18.5 4.5625 18.0312 5 17.5 5C16.9375 5 16.5 4.5625 16.5 4ZM17.5 6C18.0312 6 18.5 6.46875 18.5 7C18.5 7.5625 18.0312 8 17.5 8C16.9375 8 16.5 7.5625 16.5 7C16.5 6.46875 16.9375 6 17.5 6ZM16.5 10C16.5 9.46875 16.9375 9 17.5 9C18.0312 9 18.5 9.46875 18.5 10C18.5 10.5625 18.0312 11 17.5 11C16.9375 11 16.5 10.5625 16.5 10ZM14.5 6C15.0312 6 15.5 6.46875 15.5 7C15.5 7.5625 15.0312 8 14.5 8C13.9375 8 13.5 7.5625 13.5 7C13.5 6.46875 13.9375 6 14.5 6Z" }));
const SvgLoading = (props) => /* @__PURE__ */ React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", ...props }, /* @__PURE__ */ React.createElement("circle", { className: "opacity-25", cx: 12, cy: 12, r: 10, stroke: "currentColor", strokeWidth: 4 }), /* @__PURE__ */ React.createElement("path", { className: "opacity-75", fill: "currentColor", d: "M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" }));
const SvgGenerator = (props) => /* @__PURE__ */ React.createElement("svg", { width: 35, height: 35, viewBox: "0 0 33 33", fill: "none", xmlns: "http://www.w3.org/2000/svg", className: "absolute right-4", ...props }, /* @__PURE__ */ React.createElement("rect", { x: 0.5, y: 0.5, width: 32, height: 32, rx: 16, fill: "white" }), /* @__PURE__ */ React.createElement("path", { d: "M17.1562 9.9375L19.0312 13.9688L23.0625 15.8438C23.3125 15.9688 23.5 16.2188 23.5 16.5C23.5 16.8125 23.3125 17.0625 23.0625 17.1875L19.0312 19.0625L17.1562 23.0938C17.0312 23.3438 16.7812 23.5 16.5 23.5C16.1875 23.5 15.9375 23.3438 15.8125 23.0938L13.9375 19.0625L9.90625 17.1875C9.65625 17.0625 9.5 16.8125 9.5 16.5C9.5 16.2188 9.65625 15.9688 9.90625 15.8438L13.9375 13.9688L15.8125 9.9375C15.9375 9.6875 16.1875 9.5 16.5 9.5C16.7812 9.5 17.0312 9.6875 17.1562 9.9375Z", fill: "black" }));
function ActionButtons({
  handleGenerate,
  isLoading,
  prompt,
  setShowDesignChoicesModal
}) {
  return /* @__PURE__ */ jsxs("div", { className: "flex flex-col sm:flex-row flex-wrap gap-4 justify-between items-center", children: [
    /* @__PURE__ */ jsx("div", { className: "flex gap-3 w-full sm:w-auto", children: /* @__PURE__ */ jsxs(
      "button",
      {
        className: " hidden sm:inline-flex relative w-full sm:w-fit bg-gray-100 hover:bg-gray-200 text-black rounded-full border-2 border-solid border-gray-300 cursor-pointer transition-all duration-0 flex items-center justify-center gap-2 px-4 py-3",
        onClick: () => setShowDesignChoicesModal(true),
        type: "button",
        children: [
          /* @__PURE__ */ jsx(SvgUpload, { width: "18", height: "18" }),
          /* @__PURE__ */ jsx("span", { children: "Upload Reference" })
        ]
      }
    ) }),
    /* @__PURE__ */ jsx(
      "button",
      {
        className: "w-full sm:w-3/5 flex items-center justify-center gap-2 bg-black text-white hover:bg-gray-800 hover:shadow-lg active:scale-95 disabled:cursor-not-allowed disabled:active:scale-100 transition-all shadow-md font-medium relative rounded-full px-4 py-3 cursor-pointer",
        onClick: handleGenerate,
        disabled: isLoading || !prompt.trim(),
        type: "button",
        children: isLoading ? /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx(SvgLoading, { className: "animate-spin h-5 w-5 text-white" }),
          /* @__PURE__ */ jsx("span", { children: "Generating..." })
        ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx("span", { children: "Generate Tattoo" }),
          /* @__PURE__ */ jsx(SvgGenerator, { width: "20", height: "20" })
        ] })
      }
    )
  ] });
}
const SvgEye = (props) => /* @__PURE__ */ React.createElement("svg", { width: 20, height: 20, viewBox: "0 0 24 24", fill: "none", xmlns: "http://www.w3.org/2000/svg", ...props }, /* @__PURE__ */ React.createElement("path", { d: "M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" }), /* @__PURE__ */ React.createElement("path", { d: "M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" }));
const SvgDownload = (props) => /* @__PURE__ */ React.createElement("svg", { width: 20, height: 20, viewBox: "0 0 24 24", fill: "none", xmlns: "http://www.w3.org/2000/svg", ...props }, /* @__PURE__ */ React.createElement("path", { d: "M4 21H20", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" }), /* @__PURE__ */ React.createElement("path", { d: "M12 3V17", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" }), /* @__PURE__ */ React.createElement("path", { d: "M7 12L12 17L17 12", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" }));
function ResultGrid({ generatedImages, setPreviewImage, handleDownload }) {
  if (generatedImages.length === 0) return null;
  return /* @__PURE__ */ jsxs("div", { className: "mt-8 space-y-4", children: [
    /* @__PURE__ */ jsx("h3", { className: "text-lg font-semibold text-gray-900", children: "Generated Results" }),
    /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-4", children: generatedImages.map((image, index2) => /* @__PURE__ */ jsxs("div", { className: "group relative aspect-square rounded-xl overflow-hidden bg-gray-100 shadow-sm hover:shadow-md transition-all", children: [
      /* @__PURE__ */ jsx(
        "img",
        {
          src: image,
          alt: `Generated tattoo ${index2 + 1}`,
          className: "w-full h-full object-cover cursor-pointer",
          onClick: () => setPreviewImage(image)
        }
      ),
      /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors pointer-events-none" }),
      /* @__PURE__ */ jsxs("div", { className: "absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2", children: [
        /* @__PURE__ */ jsx(
          "button",
          {
            className: "p-2 bg-white/90 hover:bg-white text-gray-700 rounded-full shadow-sm backdrop-blur-sm transition-transform hover:scale-105 cursor-pointer",
            onClick: (e) => {
              e.stopPropagation();
              setPreviewImage(image);
            },
            title: "Preview",
            type: "button",
            children: /* @__PURE__ */ jsx(SvgEye, { width: "20", height: "20" })
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            className: "p-2 bg-white/90 hover:bg-white text-gray-700 rounded-full shadow-sm backdrop-blur-sm transition-transform hover:scale-105 cursor-pointer",
            onClick: (e) => {
              e.stopPropagation();
              handleDownload(image);
            },
            title: "Download",
            type: "button",
            children: /* @__PURE__ */ jsx(SvgDownload, { width: "20", height: "20" })
          }
        )
      ] })
    ] }, index2)) })
  ] });
}
function ImagePreviewModal({ previewImage, setPreviewImage, handleDownload }) {
  if (!previewImage) return null;
  return /* @__PURE__ */ jsx(
    Modal,
    {
      open: !!previewImage,
      onClose: () => setPreviewImage(null),
      title: "Preview",
      size: "large",
      children: /* @__PURE__ */ jsx(Modal.Section, { children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center gap-4", children: [
        /* @__PURE__ */ jsx(
          "img",
          {
            src: previewImage,
            alt: "Full size preview",
            className: "max-w-full max-h-[70vh] object-contain rounded-lg shadow-lg"
          }
        ),
        /* @__PURE__ */ jsx("div", { className: "flex justify-end w-full", children: /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: () => handleDownload(previewImage),
            className: "flex items-center gap-2 px-4 py-2 bg-black text-white rounded-full hover:bg-gray-800 transition-colors",
            type: "button",
            children: [
              /* @__PURE__ */ jsx(SvgDownload, { width: "20", height: "20", className: "text-white" }),
              /* @__PURE__ */ jsx("span", { children: "Download" })
            ]
          }
        ) })
      ] }) })
    }
  );
}
function UploadModal({
  showDesignChoicesModal,
  setShowDesignChoicesModal,
  uploadedImage,
  handleDropZoneDrop,
  setUploadedImage
}) {
  const validImageTypes = ["image/gif", "image/jpeg", "image/png"];
  const fileUpload = !uploadedImage && /* @__PURE__ */ jsx(DropZone.FileUpload, {});
  const uploadedFile = uploadedImage && /* @__PURE__ */ jsxs(LegacyStack, { children: [
    /* @__PURE__ */ jsx(
      Thumbnail,
      {
        size: "small",
        alt: uploadedImage.name,
        source: validImageTypes.includes(uploadedImage.type) ? window.URL.createObjectURL(uploadedImage) : NoteIcon
      }
    ),
    /* @__PURE__ */ jsxs("div", { children: [
      uploadedImage.name,
      " ",
      /* @__PURE__ */ jsxs(Text, { variant: "bodySm", as: "p", children: [
        uploadedImage.size,
        " bytes"
      ] })
    ] })
  ] });
  return /* @__PURE__ */ jsx(
    Modal,
    {
      open: showDesignChoicesModal,
      onClose: () => setShowDesignChoicesModal(false),
      title: "Upload Reference Image",
      primaryAction: {
        content: "Confirm",
        onAction: () => setShowDesignChoicesModal(false)
      },
      secondaryActions: [
        {
          content: "Clear",
          onAction: () => setUploadedImage(null)
        }
      ],
      children: /* @__PURE__ */ jsxs(Modal.Section, { children: [
        /* @__PURE__ */ jsxs(DropZone, { onDrop: handleDropZoneDrop, children: [
          uploadedFile,
          fileUpload
        ] }),
        /* @__PURE__ */ jsx("div", { className: "mt-4", children: /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-500", children: "Upload an image to use as a reference for the style or composition." }) })
      ] })
    }
  );
}
function ChatBubble({ role, content: content2, images, onDownload, onImageClick }) {
  const isUser = role === "user";
  const handleKeyDown = (e, action2) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      action2();
    }
  };
  return /* @__PURE__ */ jsx("div", { className: `flex w-full ${isUser ? "justify-end" : "justify-start"} mb-4`, children: /* @__PURE__ */ jsxs("div", { className: `flex max-w-[80%] ${isUser ? "flex-row-reverse" : "flex-row"} gap-3`, children: [
    /* @__PURE__ */ jsx("div", { className: "flex-shrink-0", children: /* @__PURE__ */ jsx("div", { className: `w-8 h-8 rounded-full flex items-center justify-center ${isUser ? "bg-indigo-100 text-indigo-600" : "bg-emerald-100 text-emerald-600"}`, children: isUser ? /* @__PURE__ */ jsx(PersonIcon, { className: "w-5 h-5" }) : /* @__PURE__ */ jsx(MagicIcon, { className: "w-5 h-5" }) }) }),
    /* @__PURE__ */ jsxs("div", { className: `flex flex-col ${isUser ? "items-end" : "items-start"}`, children: [
      /* @__PURE__ */ jsx("div", { className: `p-3 rounded-2xl ${isUser ? "bg-indigo-600 text-white rounded-tr-sm" : "bg-white border border-gray-200 text-gray-800 rounded-tl-sm shadow-sm"}`, children: /* @__PURE__ */ jsx("div", { className: "text-sm md:text-base whitespace-pre-wrap leading-relaxed", children: content2 }) }),
      images && images.length > 0 && /* @__PURE__ */ jsx("div", { className: "mt-3 grid grid-cols-2 gap-2 w-full max-w-md", children: images.map((img, index2) => /* @__PURE__ */ jsxs("div", { className: "relative group aspect-square rounded-lg overflow-hidden border border-gray-200", children: [
        /* @__PURE__ */ jsx(
          "div",
          {
            role: "button",
            tabIndex: 0,
            "aria-label": `View generated tattoo ${index2 + 1}`,
            className: "w-full h-full cursor-pointer",
            onClick: () => onImageClick == null ? void 0 : onImageClick(img),
            onKeyDown: (e) => onImageClick && handleKeyDown(e, () => onImageClick(img)),
            children: /* @__PURE__ */ jsx(
              "img",
              {
                src: img,
                alt: `Generated tattoo ${index2 + 1}`,
                className: "w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              }
            )
          }
        ),
        onDownload && /* @__PURE__ */ jsx(
          "button",
          {
            onClick: (e) => {
              e.stopPropagation();
              onDownload(img);
            },
            onKeyDown: (e) => {
              e.stopPropagation();
              handleKeyDown(e, () => onDownload(img));
            },
            className: "absolute bottom-2 right-2 p-1.5 bg-white/90 rounded-full shadow-sm hover:bg-white text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity",
            title: "Download",
            "aria-label": `Download generated tattoo ${index2 + 1}`,
            children: /* @__PURE__ */ jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [
              /* @__PURE__ */ jsx("path", { d: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" }),
              /* @__PURE__ */ jsx("polyline", { points: "7 10 12 15 17 10" }),
              /* @__PURE__ */ jsx("line", { x1: "12", y1: "15", x2: "12", y2: "3" })
            ] })
          }
        )
      ] }, index2)) })
    ] })
  ] }) });
}
const SvgSendMessage = (props) => /* @__PURE__ */ React.createElement("svg", { width: 21, height: 21, viewBox: "0 0 21 20", fill: "currentColor", xmlns: "http://www.w3.org/2000/svg", ...props }, /* @__PURE__ */ React.createElement("path", { d: "M12.7188 4.6875L14.5 4L15.1562 2.25C15.1875 2.09375 15.3438 2 15.5 2C15.625 2 15.7812 2.09375 15.8125 2.25L16.5 4L18.25 4.6875C18.4062 4.71875 18.5 4.875 18.5 5C18.5 5.15625 18.4062 5.3125 18.25 5.34375L16.5 6L15.8125 7.78125C15.7812 7.90625 15.625 8 15.5 8C15.3438 8 15.1875 7.90625 15.1562 7.78125L14.5 6L12.7188 5.34375C12.5938 5.3125 12.5 5.15625 12.5 5C12.5 4.875 12.5938 4.71875 12.7188 4.6875ZM8.90625 4.3125L10.5312 7.875L14.0938 9.5C14.2812 9.59375 14.4062 9.78125 14.4062 9.96875C14.4062 10.1562 14.2812 10.3438 14.0938 10.4062L10.5312 12.0625L8.90625 15.625C8.8125 15.8125 8.625 15.9375 8.4375 15.9375C8.25 15.9375 8.0625 15.8125 8 15.625L6.34375 12.0625L2.78125 10.4375C2.59375 10.3438 2.5 10.1562 2.5 9.96875C2.5 9.78125 2.59375 9.59375 2.78125 9.5L6.34375 7.875L8 4.3125C8.0625 4.125 8.25 4 8.4375 4C8.625 4 8.8125 4.125 8.90625 4.3125ZM14.5 14L15.1562 12.25C15.1875 12.0938 15.3438 12 15.5 12C15.625 12 15.7812 12.0938 15.8125 12.25L16.5 14L18.25 14.6875C18.4062 14.7188 18.5 14.875 18.5 15C18.5 15.1562 18.4062 15.3125 18.25 15.3438L16.5 16L15.8125 17.7812C15.7812 17.9062 15.625 18 15.5 18C15.3438 18 15.1875 17.9062 15.1562 17.7812L14.5 16L12.7188 15.3438C12.5938 15.3125 12.5 15.1562 12.5 15C12.5 14.875 12.5938 14.7188 12.7188 14.6875L14.5 14Z" }));
const SvgClose = (props) => /* @__PURE__ */ React.createElement("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, xmlns: "http://www.w3.org/2000/svg", ...props }, /* @__PURE__ */ React.createElement("line", { x1: 18, y1: 6, x2: 6, y2: 18 }), /* @__PURE__ */ React.createElement("line", { x1: 6, y1: 6, x2: 18, y2: 18 }));
const inner = "_inner_hzxps_11";
const panel = "_panel_hzxps_18";
const styles = {
  inner,
  panel
};
function PromptInput({
  prompt,
  setPrompt,
  onSurpriseMe,
  uploadedImage,
  handleRemoveImage,
  setShowDesignChoicesModal,
  handleSend,
  onUploadClick,
  disabled = false,
  placeholder = "Describe your dream tattoo in detail..."
}) {
  const imageUrl = uploadedImage ? window.URL.createObjectURL(uploadedImage) : null;
  const textareaRef = useRef(null);
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [prompt]);
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend == null ? void 0 : handleSend();
    }
  };
  return /* @__PURE__ */ jsx("div", { className: `${styles.panel} rounded-xl sm:rounded-2xl transition-all duration-200`, children: /* @__PURE__ */ jsx("div", { className: `${styles.inner} rounded-xl sm:rounded-2xl`, children: /* @__PURE__ */ jsx("div", { className: `rounded-xl sm:rounded-2xl p-0 sm:p-2 border border-gray-100 shadow-sm bg-white`, children: /* @__PURE__ */ jsxs("div", { className: "relative w-full flex flex-col", children: [
    /* @__PURE__ */ jsx(
      "textarea",
      {
        ref: textareaRef,
        className: `${uploadedImage ? "pt-14" : "pt-5"} w-full min-h-[50px] max-h-[120px] p-3 pr-12 rounded-xl bg-transparent text-gray-900 placeholder:text-gray-400 focus:outline-none sm:text-base leading-relaxed resize-none custom-scrollbar`,
        placeholder,
        value: prompt,
        onChange: (e) => {
          const value = e.target.value;
          if (value.length <= 500) {
            setPrompt(value);
          }
        },
        onKeyDown: handleKeyDown,
        disabled,
        rows: 1,
        maxLength: 500,
        "aria-label": "Tattoo prompt"
      }
    ),
    uploadedImage && imageUrl && /* @__PURE__ */ jsx("div", { className: "absolute top-3 left-5 flex gap-2 z-10", children: /* @__PURE__ */ jsxs("div", { className: "relative w-10 h-10 rounded-md overflow-hidden border border-gray-200 group bg-white", children: [
      /* @__PURE__ */ jsx("img", { src: imageUrl, alt: "Upload", className: "w-full h-full object-cover" }),
      /* @__PURE__ */ jsx(
        "button",
        {
          type: "button",
          onClick: (e) => {
            e.stopPropagation();
            handleRemoveImage();
          },
          className: "absolute top-0 right-0 bg-black/60 text-white p-0.5 rounded-bl-md opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center w-5 h-5",
          children: /* @__PURE__ */ jsx(SvgClose, { width: "10", height: "10" })
        }
      )
    ] }) }),
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between px-2 pb-2 mt-1", children: [
      /* @__PURE__ */ jsx("div", { className: "flex items-center gap-2", children: onUploadClick && /* @__PURE__ */ jsxs(
        "button",
        {
          className: "flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-50 text-indigo-600 hover:bg-indigo-100 text-xs font-semibold transition-colors",
          onClick: onUploadClick,
          type: "button",
          title: "Upload Reference",
          disabled,
          "aria-label": "Upload reference image",
          children: [
            /* @__PURE__ */ jsx(SvgUpload, { width: "20", height: "20" }),
            /* @__PURE__ */ jsx("span", { children: "Upload" })
          ]
        }
      ) }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsxs("span", { className: "text-xs text-gray-400 font-medium hidden sm:inline-block", children: [
          prompt.length,
          "/500"
        ] }),
        handleSend && (prompt.length > 0 ? /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            onClick: handleSend,
            disabled: disabled || !prompt.trim(),
            className: `p-2 rounded-full transition-all duration-200 ${prompt.trim() && !disabled ? "bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm" : "bg-gray-100 text-gray-400 cursor-not-allowed"}`,
            "aria-label": "Send prompt",
            children: /* @__PURE__ */ jsx(SvgSendMessage, { width: "14", height: "14" })
          }
        ) : onSurpriseMe && /* @__PURE__ */ jsxs(
          "button",
          {
            className: "flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-50 text-indigo-600 hover:bg-indigo-100 text-xs font-semibold transition-colors",
            onClick: onSurpriseMe,
            type: "button",
            title: "Surprise me!",
            disabled,
            "aria-label": "Generate random prompt",
            children: [
              /* @__PURE__ */ jsx(SvgSparkle, { width: "14", height: "14" }),
              /* @__PURE__ */ jsx("span", { className: "hidden sm:inline", children: "Surprise Me" })
            ]
          }
        ))
      ] })
    ] })
  ] }) }) }) });
}
function ChatInterface({
  onGenerate,
  isLoading,
  generatedImages,
  onDownload,
  onImageClick,
  onUploadClick,
  uploadedImage,
  onRemoveImage
}) {
  const [messages, setMessages] = useState([
    {
      id: "1",
      role: "assistant",
      content: "Hi! I'm your AI Tattoo Artist. Describe your tattoo idea, and I'll help you design it. What do you have in mind?",
      type: "text"
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [currentPrompt, setCurrentPrompt] = useState("");
  const [selectedStyle, setSelectedStyle] = useState(null);
  const [step, setStep] = useState("prompt");
  const messagesEndRef = useRef(null);
  useEffect(() => {
    var _a2;
    (_a2 = messagesEndRef.current) == null ? void 0 : _a2.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);
  useEffect(() => {
    if (generatedImages.length > 0) {
      addMessage({
        role: "assistant",
        content: "Here are some designs I created for you!",
        type: "image_result",
        images: generatedImages
      });
      setStep("generate");
    }
  }, [generatedImages]);
  const addMessage = (msg) => {
    setMessages((prev) => [...prev, { ...msg, id: Date.now().toString() }]);
  };
  const handleSend = () => {
    if (!inputValue.trim() && !uploadedImage) return;
    const userText = inputValue.trim();
    setInputValue("");
    let content2 = userText;
    if (uploadedImage && !userText) content2 = "Uploaded an image for reference.";
    addMessage({ role: "user", content: content2 });
    if (step === "prompt") {
      setCurrentPrompt(userText);
      setStep("style");
      setTimeout(() => {
        addMessage({
          role: "assistant",
          content: "Great idea! Now, choose a style for your tattoo:",
          type: "style_selection"
        });
      }, 600);
    } else if (step === "generate") {
      const newPrompt = currentPrompt ? `${currentPrompt}. ${userText}` : userText;
      setCurrentPrompt(newPrompt);
      setTimeout(() => {
        addMessage({
          role: "assistant",
          content: `Updating the design with your feedback...`,
          type: "text"
        });
        onGenerate(newPrompt, selectedStyle || "No Style");
      }, 600);
    }
  };
  const handleStyleSelect = (style) => {
    const validStyle = style === "No Style" ? "No Style" : style;
    setSelectedStyle(validStyle === "No Style" ? null : validStyle);
    addMessage({ role: "user", content: `I'll go with ${style} style.` });
    setStep("generate");
    setTimeout(() => {
      addMessage({
        role: "assistant",
        content: `Perfect! Creating a ${style} tattoo based on: "${currentPrompt}". This might take a moment...`,
        type: "text"
      });
      onGenerate(currentPrompt, validStyle);
    }, 600);
  };
  const handleSurpriseMe = () => {
    const randomPrompt = surprisePrompts[Math.floor(Math.random() * surprisePrompts.length)];
    setInputValue(randomPrompt);
  };
  const handleButtonKeyDown = (e, action2) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      action2 == null ? void 0 : action2();
    }
  };
  return /* @__PURE__ */ jsxs("div", { className: "flex flex-col h-[600px] w-full max-w-3xl mx-auto bg-gray-50 rounded-2xl shadow-lg overflow-hidden border border-gray-200", children: [
    /* @__PURE__ */ jsxs(
      "div",
      {
        className: "flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar",
        role: "log",
        "aria-label": "Chat history",
        tabIndex: 0,
        children: [
          messages.map((msg) => /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(
              ChatBubble,
              {
                role: msg.role,
                content: msg.content,
                images: msg.images,
                onDownload,
                onImageClick
              }
            ),
            msg.type === "style_selection" && !selectedStyle && step === "style" && /* @__PURE__ */ jsxs("div", { className: "pl-11 grid grid-cols-2 md:grid-cols-3 gap-2 mt-2 mb-4", children: [
              stylesList.slice(0, 6).map((style) => /* @__PURE__ */ jsx(
                "button",
                {
                  onClick: () => handleStyleSelect(style),
                  onKeyDown: (e) => handleButtonKeyDown(e, () => handleStyleSelect(style)),
                  className: "px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-colors text-left",
                  "aria-label": `Select ${style} style`,
                  tabIndex: 0,
                  children: style
                },
                style
              )),
              /* @__PURE__ */ jsx(
                "button",
                {
                  onClick: () => handleStyleSelect("No Style"),
                  onKeyDown: (e) => handleButtonKeyDown(e, () => handleStyleSelect("No Style")),
                  className: "px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-colors text-left text-gray-500 italic",
                  "aria-label": "Select random style",
                  tabIndex: 0,
                  children: "Surprise Me (Any Style)"
                }
              )
            ] })
          ] }, msg.id)),
          isLoading && /* @__PURE__ */ jsx("div", { className: "flex w-full justify-start mb-4", children: /* @__PURE__ */ jsx("div", { className: "flex max-w-[80%] flex-row gap-3", children: /* @__PURE__ */ jsxs("div", { className: "w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center", children: [
            /* @__PURE__ */ jsx("div", { className: "w-2 h-2 bg-emerald-500 rounded-full animate-bounce", style: { animationDelay: "0ms" } }),
            /* @__PURE__ */ jsx("div", { className: "w-2 h-2 bg-emerald-500 rounded-full animate-bounce mx-0.5", style: { animationDelay: "150ms" } }),
            /* @__PURE__ */ jsx("div", { className: "w-2 h-2 bg-emerald-500 rounded-full animate-bounce", style: { animationDelay: "300ms" } })
          ] }) }) }),
          /* @__PURE__ */ jsx("div", { ref: messagesEndRef })
        ]
      }
    ),
    /* @__PURE__ */ jsx("div", { className: "p-4 bg-white border-t border-gray-100", children: /* @__PURE__ */ jsxs("div", { className: "max-w-3xl mx-auto", children: [
      uploadedImage && /* @__PURE__ */ jsxs("div", { className: "mb-2 inline-flex relative group", children: [
        /* @__PURE__ */ jsx("div", { className: "w-16 h-16 rounded-lg overflow-hidden border border-gray-200", children: /* @__PURE__ */ jsx(
          "img",
          {
            src: URL.createObjectURL(uploadedImage),
            alt: "Upload preview",
            className: "w-full h-full object-cover"
          }
        ) }),
        onRemoveImage && /* @__PURE__ */ jsx(
          "button",
          {
            onClick: onRemoveImage,
            onKeyDown: (e) => handleButtonKeyDown(e, onRemoveImage),
            className: "absolute -top-2 -right-2 bg-white rounded-full p-0.5 shadow-md border border-gray-100 text-gray-500 hover:text-red-500 transition-colors",
            "aria-label": "Remove uploaded image",
            tabIndex: 0,
            children: /* @__PURE__ */ jsx(XIcon, { className: "w-4 h-4" })
          }
        )
      ] }),
      /* @__PURE__ */ jsx(
        PromptInput,
        {
          prompt: inputValue,
          setPrompt: setInputValue,
          handleSend,
          onSurpriseMe: handleSurpriseMe,
          disabled: isLoading || step === "style" && !selectedStyle,
          onUploadClick: step === "prompt" ? onUploadClick : void 0,
          placeholder: step === "style" ? "Select a style above..." : step === "generate" ? "Describe changes or adjustments..." : "Describe your dream tattoo..."
        }
      )
    ] }) }),
    /* @__PURE__ */ jsx("style", { children: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #cbd5e1;
          border-radius: 20px;
        }
      ` })
  ] });
}
const loader = async ({
  request
}) => {
  await authenticate.admin(request);
  return {
    apiKey: process.env.SHOPIFY_API_KEY || ""
  };
};
const action = async ({
  request
}) => {
  const {
    admin
  } = await authenticate.admin(request);
  const formData = await request.formData();
  formData.get("prompt");
  formData.get("style");
  await new Promise((resolve) => setTimeout(resolve, 2e3));
  return {
    status: "success",
    images: ["https://images.unsplash.com/photo-1590246814883-05add5d833a6?q=80&w=600&auto=format&fit=crop", "https://images.unsplash.com/photo-1598371839696-5c5bb00bdc28?q=80&w=600&auto=format&fit=crop", "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=600&auto=format&fit=crop", "https://images.unsplash.com/photo-1562962230-16e4623d36e6?q=80&w=600&auto=format&fit=crop"]
  };
};
const route = UNSAFE_withComponentProps(function TattooGenerator() {
  const {
    apiKey
  } = useLoaderData();
  const actionData = useActionData();
  const submit = useSubmit();
  const navigation = useNavigation();
  const isLoading = navigation.state === "submitting";
  const [prompt, setPrompt] = useState("");
  const [selectedStyle, setSelectedStyle] = useState("No Style");
  const [generatedImages, setGeneratedImages] = useState([]);
  const [showDesignChoicesModal, setShowDesignChoicesModal] = useState(false);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  useEffect(() => {
    getAllImagesFromDB().then((images) => {
      if (images && images.length > 0) {
        setGeneratedImages(images.map((img) => img.url));
      }
    });
  }, []);
  useEffect(() => {
    if ((actionData == null ? void 0 : actionData.status) === "success" && actionData.images) {
      setGeneratedImages(actionData.images);
      actionData.images.forEach((url) => {
        saveImageToDB(url, prompt, selectedStyle);
      });
    }
  }, [actionData, prompt, selectedStyle]);
  const handleGenerate = async (promptText, styleName) => {
    const textToUse = promptText || prompt;
    const styleToUse = styleName || selectedStyle;
    if (!textToUse) return;
    setPrompt(textToUse);
    if (styleToUse) setSelectedStyle(styleToUse);
    const formData = new FormData();
    formData.append("prompt", textToUse);
    formData.append("style", styleToUse || "No Style");
    submit(formData, {
      method: "post"
    });
  };
  const handleDropZoneDrop = useCallback((_dropFiles, acceptedFiles, _rejectedFiles) => {
    setUploadedImage(acceptedFiles[0]);
  }, []);
  const handleDownload = async (imageUrl) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `tattoo-design-${Date.now()}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download failed:", error);
    }
  };
  const handleRemoveImage = () => {
    setUploadedImage(null);
  };
  return /* @__PURE__ */ jsxs(Page, {
    fullWidth: true,
    children: [/* @__PURE__ */ jsx(Layout, {
      children: /* @__PURE__ */ jsx(Layout.Section, {
        children: /* @__PURE__ */ jsx(Card, {
          children: /* @__PURE__ */ jsxs(BlockStack, {
            gap: "500",
            children: [/* @__PURE__ */ jsx(Header, {}), /* @__PURE__ */ jsxs("div", {
              className: "grid grid-cols-1 lg:grid-cols-12 gap-8",
              children: [/* @__PURE__ */ jsxs("div", {
                className: "lg:col-span-4 space-y-6",
                children: [/* @__PURE__ */ jsx(ChatInterface, {
                  onGenerate: handleGenerate,
                  isLoading,
                  generatedImages,
                  onDownload: handleDownload,
                  onImageClick: setPreviewImage,
                  onUploadClick: () => setShowDesignChoicesModal(true),
                  uploadedImage,
                  onRemoveImage: handleRemoveImage
                }), /* @__PURE__ */ jsx(StyleSelector, {
                  selectedStyle,
                  setSelectedStyle
                }), /* @__PURE__ */ jsx(ActionButtons, {
                  handleGenerate,
                  isLoading,
                  prompt,
                  setShowDesignChoicesModal
                })]
              }), /* @__PURE__ */ jsx("div", {
                className: "lg:col-span-8",
                children: generatedImages.length > 0 ? /* @__PURE__ */ jsx(ResultGrid, {
                  generatedImages,
                  setPreviewImage,
                  handleDownload
                }) : /* @__PURE__ */ jsxs("div", {
                  className: "h-full min-h-[400px] flex flex-col items-center justify-center text-gray-400 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200",
                  children: [/* @__PURE__ */ jsx("div", {
                    className: "w-16 h-16 mb-4 opacity-20",
                    children: /* @__PURE__ */ jsx("svg", {
                      viewBox: "0 0 24 24",
                      fill: "none",
                      stroke: "currentColor",
                      strokeWidth: "1",
                      children: /* @__PURE__ */ jsx("path", {
                        d: "M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      })
                    })
                  }), /* @__PURE__ */ jsx("p", {
                    children: "Generated tattoo designs will appear here"
                  })]
                })
              })]
            })]
          })
        })
      })
    }), /* @__PURE__ */ jsx(ImagePreviewModal, {
      previewImage,
      setPreviewImage,
      handleDownload
    }), /* @__PURE__ */ jsx(UploadModal, {
      showDesignChoicesModal,
      setShowDesignChoicesModal,
      uploadedImage,
      handleDropZoneDrop,
      setUploadedImage
    })]
  });
});
const route9 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  action,
  default: route,
  loader
}, Symbol.toStringTag, { value: "Module" }));
const serverManifest = { "entry": { "module": "/assets/entry.client-CFeZ1GHa.js", "imports": ["/assets/chunk-4WY6JWTD-DSrxSWZw.js", "/assets/index-Cs_PSIf1.js"], "css": [] }, "routes": { "root": { "id": "root", "parentId": void 0, "path": "", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasErrorBoundary": false, "module": "/assets/root-DoUqzsAW.js", "imports": ["/assets/chunk-4WY6JWTD-DSrxSWZw.js", "/assets/index-Cs_PSIf1.js"], "css": ["/assets/root-vetZWLKI.css"], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/webhooks.app.scopes_update": { "id": "routes/webhooks.app.scopes_update", "parentId": "root", "path": "webhooks/app/scopes_update", "index": void 0, "caseSensitive": void 0, "hasAction": true, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasErrorBoundary": false, "module": "/assets/webhooks.app.scopes_update-l0sNRNKZ.js", "imports": [], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/webhooks.app.uninstalled": { "id": "routes/webhooks.app.uninstalled", "parentId": "root", "path": "webhooks/app/uninstalled", "index": void 0, "caseSensitive": void 0, "hasAction": true, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasErrorBoundary": false, "module": "/assets/webhooks.app.uninstalled-l0sNRNKZ.js", "imports": [], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/api.generate-tattoo": { "id": "routes/api.generate-tattoo", "parentId": "root", "path": "api/generate-tattoo", "index": void 0, "caseSensitive": void 0, "hasAction": true, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasErrorBoundary": false, "module": "/assets/api.generate-tattoo-l0sNRNKZ.js", "imports": [], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/auth.login": { "id": "routes/auth.login", "parentId": "root", "path": "auth/login", "index": void 0, "caseSensitive": void 0, "hasAction": true, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasErrorBoundary": false, "module": "/assets/route-BIq5w9qC.js", "imports": ["/assets/chunk-4WY6JWTD-DSrxSWZw.js", "/assets/AppProxyProvider-DgU0IEHk.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/_index": { "id": "routes/_index", "parentId": "root", "path": void 0, "index": true, "caseSensitive": void 0, "hasAction": false, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasErrorBoundary": false, "module": "/assets/route-Dw7iv-tJ.js", "imports": ["/assets/chunk-4WY6JWTD-DSrxSWZw.js"], "css": ["/assets/route-Xpdx9QZl.css"], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/auth.$": { "id": "routes/auth.$", "parentId": "root", "path": "auth/*", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasErrorBoundary": false, "module": "/assets/auth._-l0sNRNKZ.js", "imports": [], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/app": { "id": "routes/app", "parentId": "root", "path": "app", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasErrorBoundary": true, "module": "/assets/app-DmXa7knW.js", "imports": ["/assets/chunk-4WY6JWTD-DSrxSWZw.js", "/assets/AppProxyProvider-DgU0IEHk.js", "/assets/context-DyICP9bL.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/app.additional": { "id": "routes/app.additional", "parentId": "routes/app", "path": "additional", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasErrorBoundary": false, "module": "/assets/app.additional-BkplF5p6.js", "imports": ["/assets/chunk-4WY6JWTD-DSrxSWZw.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/app._index": { "id": "routes/app._index", "parentId": "routes/app", "path": void 0, "index": true, "caseSensitive": void 0, "hasAction": true, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasErrorBoundary": false, "module": "/assets/route-Ck9A9AWm.js", "imports": ["/assets/chunk-4WY6JWTD-DSrxSWZw.js", "/assets/context-DyICP9bL.js", "/assets/index-Cs_PSIf1.js"], "css": ["/assets/route-iaGCa6r1.css"], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 } }, "url": "/assets/manifest-8baeb2f8.js", "version": "8baeb2f8", "sri": void 0 };
const assetsBuildDirectory = "build/client";
const basename = "/";
const future = { "v8_middleware": false, "unstable_optimizeDeps": false, "unstable_splitRouteModules": false, "unstable_subResourceIntegrity": false, "unstable_viteEnvironmentApi": false };
const ssr = true;
const isSpaMode = false;
const prerender = [];
const routeDiscovery = { "mode": "lazy", "manifestPath": "/__manifest" };
const publicPath = "/";
const entry = { module: entryServer };
const routes = {
  "root": {
    id: "root",
    parentId: void 0,
    path: "",
    index: void 0,
    caseSensitive: void 0,
    module: route0
  },
  "routes/webhooks.app.scopes_update": {
    id: "routes/webhooks.app.scopes_update",
    parentId: "root",
    path: "webhooks/app/scopes_update",
    index: void 0,
    caseSensitive: void 0,
    module: route1
  },
  "routes/webhooks.app.uninstalled": {
    id: "routes/webhooks.app.uninstalled",
    parentId: "root",
    path: "webhooks/app/uninstalled",
    index: void 0,
    caseSensitive: void 0,
    module: route2
  },
  "routes/api.generate-tattoo": {
    id: "routes/api.generate-tattoo",
    parentId: "root",
    path: "api/generate-tattoo",
    index: void 0,
    caseSensitive: void 0,
    module: route3
  },
  "routes/auth.login": {
    id: "routes/auth.login",
    parentId: "root",
    path: "auth/login",
    index: void 0,
    caseSensitive: void 0,
    module: route4
  },
  "routes/_index": {
    id: "routes/_index",
    parentId: "root",
    path: void 0,
    index: true,
    caseSensitive: void 0,
    module: route5
  },
  "routes/auth.$": {
    id: "routes/auth.$",
    parentId: "root",
    path: "auth/*",
    index: void 0,
    caseSensitive: void 0,
    module: route6
  },
  "routes/app": {
    id: "routes/app",
    parentId: "root",
    path: "app",
    index: void 0,
    caseSensitive: void 0,
    module: route7
  },
  "routes/app.additional": {
    id: "routes/app.additional",
    parentId: "routes/app",
    path: "additional",
    index: void 0,
    caseSensitive: void 0,
    module: route8
  },
  "routes/app._index": {
    id: "routes/app._index",
    parentId: "routes/app",
    path: void 0,
    index: true,
    caseSensitive: void 0,
    module: route9
  }
};
export {
  serverManifest as assets,
  assetsBuildDirectory,
  basename,
  entry,
  future,
  isSpaMode,
  prerender,
  publicPath,
  routeDiscovery,
  routes,
  ssr
};
