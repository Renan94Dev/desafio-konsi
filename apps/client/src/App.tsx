import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useAxios } from "./hooks/useAxios";
import ReactLoading from "react-loading";

function App() {
  const [processing, setProcessing] = useState(false);

  const { makeRequest, cancelRequest, loading } = useAxios();

  const sseRef = useRef<null | EventSource>(null);
  const responseDiv = useRef<HTMLDivElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<schemaType>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: schemaType) => {
    setProcessing(true);

    const response = await makeRequest({
      method: "POST",
      url: "/api/search",
      data,
    });

    if (sseRef.current) {
      sseRef.current.close();
    }

    const EventKey = response.data.key;

    sseRef.current = new EventSource(`/api/sse`);

    sseRef.current.addEventListener(`${EventKey}`, (event) =>
      setAddEventListener(event)
    );
  };

  const setAddEventListener = useCallback((event: MessageEvent<any>) => {
    setResponseInHTML(event);
    sseRef.current?.close();
    setProcessing(false);
  }, []);

  const setResponseInHTML = (event: MessageEvent<string>) => {
    const node = responseDiv.current;
    const json = JSON.parse(event.data);

    if (node) {
      (node as HTMLDivElement).innerText =
        `CPF: ${json.result.docNumber} :: Benefícios: ${json.result.benefits}` ??
        "";
    }
  };

  const cancelSearch = useCallback(() => {
    cancelRequest();
    setProcessing(false);
  }, [cancelRequest]);

  useEffect(() => {
    return () => {
      sseRef.current?.close();
    };
  }, [setAddEventListener]);

  return (
    <div className="space-y-8 flex flex-col justify-center items-center">
      <h1>🚀 Desafio KONSI 🚀</h1>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-4 flex flex-col w-[320px]"
      >
        <input
          type="text"
          placeholder="Login"
          {...register("auth.login")}
          disabled={processing}
        />
        {errors.auth?.login?.message && <p>{errors.auth?.login?.message}</p>}

        <input
          type="text"
          placeholder="Senha"
          {...register("auth.password")}
          disabled={processing}
        />
        {errors.auth?.password?.message && (
          <p>{errors.auth?.password?.message}</p>
        )}

        <input
          type="text"
          placeholder="CPF"
          {...register("docNumber")}
          disabled={processing}
        />
        {errors.docNumber?.message && <p>{errors.docNumber?.message}</p>}

        <input
          type="submit"
          value={loading ? "Enviando..." : "Pesquisar"}
          disabled={processing}
        />
      </form>

      <div ref={responseDiv} className={processing ? "hidden" : "block"} />

      {processing && (
        <div className="flex items-center gap-2">
          <ReactLoading type="spokes" color="#DDDDDD" height={30} width={30} />
          <span>Aguarde...</span>{" "}
          <button
            onClick={cancelSearch}
            className="p-1 bg-zinc-200 rounded-full flex justify-center items-center shadow-md shadow-black/40"
          >
            <CloseIcon />
          </button>
        </div>
      )}
    </div>
  );
}

export default App;

const CloseIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="black"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <path d="m15 9-6 6" />
    <path d="m9 9 6 6" />
  </svg>
);

const schema = z.object({
  auth: z.object({
    login: z.string().nonempty({ message: "Campo obrigatório." }),
    password: z.string().nonempty({ message: "Campo obrigatório." }),
  }),
  docNumber: z
    .string()
    .nonempty({ message: "Campo obrigatório." })
    .regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, "CPF inválido."),
});

type schemaType = z.infer<typeof schema>;
