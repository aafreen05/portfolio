"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowRight, Loader2, TriangleAlert } from "lucide-react";
import { toast } from "sonner";

import { submitContactMessage, type ContactResult } from "@/app/actions/contact";
import { Sparkle } from "@/components/site/sparkle";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { contactSchema, type ContactInput } from "@/lib/validations";

export function ContactForm() {
  const reduceMotion = useReducedMotion();
  const [pending, startTransition] = React.useTransition();
  const [result, setResult] = React.useState<ContactResult | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<ContactInput>({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: "", email: "", subject: "", message: "", website: "" },
  });

  function onSubmit(values: ContactInput) {
    const formData = new FormData();
    for (const [key, value] of Object.entries(values)) {
      formData.append(key, value ?? "");
    }

    startTransition(async () => {
      const response = await submitContactMessage(null, formData);
      setResult(response);

      if (response.ok) {
        reset();
        toast.success("Message sent", { description: response.message });
        return;
      }

      // Map server-side field errors back onto the form.
      for (const [field, message] of Object.entries(response.fieldErrors ?? {})) {
        setError(field as keyof ContactInput, { type: "server", message });
      }
      toast.error("Could not send", { description: response.message });
    });
  }

  if (result?.ok) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: reduceMotion ? 1 : 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: reduceMotion ? 0 : 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="frame relative flex flex-col items-center overflow-hidden px-8 py-16 text-center"
        role="status"
      >
        {/* A star flaring as the signal lands. */}
        <span className="relative grid size-20 place-items-center text-gold">
          <span className="animate-beacon absolute inset-0 rounded-full bg-gold/25" />
          <Sparkle twinkle className="relative size-12" />
        </span>
        <p className="kicker mt-8 text-gold">Transmission complete</p>
        <h3 className="serif-italic mt-3 text-3xl">Signal received.</h3>
        <p className="mt-4 max-w-sm text-sm leading-[1.8] text-muted-foreground">{result.message}</p>
        <Button variant="bracket" size="sm" className="mt-8" onClick={() => setResult(null)}>
          Send another
        </Button>
      </motion.div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="frame relative p-7 sm:p-9"
    >
      <div className="mb-9 flex items-center justify-between gap-4 border-b border-border pb-5">
        <p className="kicker flex items-center gap-2">
          <span className="relative flex size-1.5">
            <span className="animate-beacon absolute inset-0 rounded-full bg-gold" />
            <span className="relative size-1.5 rounded-full bg-gold" />
          </span>
          Open channel
        </p>
        <p className="kicker">All fields required</p>
      </div>

      <div className="grid gap-7 sm:grid-cols-2">
        <Field label="Name" htmlFor="name" error={errors.name?.message} required>
          <Input
            id="name"
            autoComplete="name"
            placeholder="Your name"
            aria-invalid={Boolean(errors.name)}
            {...register("name")}
          />
        </Field>

        <Field label="Email" htmlFor="email" error={errors.email?.message} required>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            aria-invalid={Boolean(errors.email)}
            {...register("email")}
          />
        </Field>
      </div>

      <Field
        label="Subject"
        htmlFor="subject"
        error={errors.subject?.message}
        required
        className="mt-7"
      >
        <Input
          id="subject"
          placeholder="What is this about?"
          aria-invalid={Boolean(errors.subject)}
          {...register("subject")}
        />
      </Field>

      <Field
        label="Message"
        htmlFor="message"
        error={errors.message?.message}
        hint="A couple of sentences about what you have in mind is plenty."
        required
        className="mt-7"
      >
        <Textarea
          id="message"
          rows={6}
          placeholder="Tell me about the project, role or idea…"
          aria-invalid={Boolean(errors.message)}
          {...register("message")}
        />
      </Field>

      {/* Honeypot — hidden from people, irresistible to bots. */}
      <div aria-hidden className="absolute left-[-9999px] h-px w-px overflow-hidden">
        <label htmlFor="website">Website</label>
        <input id="website" type="text" tabIndex={-1} autoComplete="off" {...register("website")} />
      </div>

      <AnimatePresence>
        {result && !result.ok ? (
          <motion.p
            role="alert"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-6 flex items-start gap-2 border border-destructive/30 bg-destructive/8 p-3 text-sm text-destructive"
          >
            <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
            {result.message}
          </motion.p>
        ) : null}
      </AnimatePresence>

      <Button type="submit" variant="gilded" size="xl" className="mt-9 w-full sm:w-auto" disabled={pending}>
        {pending ? (
          <>
            <Loader2 className="animate-spin" aria-hidden />
            Transmitting…
          </>
        ) : (
          <>
            Transmit message
            <ArrowRight aria-hidden />
          </>
        )}
      </Button>
    </form>
  );
}
