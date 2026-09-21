"use client";

import { useEffect, useState } from "react";
import { api, type ProjectRow } from "@/lib/api";
import { useTone } from "@/lib/theme";
import { Card, Field, PrimaryButton, SelectInput, TextArea, TextInput } from "@/components/product-ui";

export default function SupportPage() {
  const t = useTone();
  const [sent, setSent] = useState(false);
  const [project, setProject] = useState("");
  const [body, setBody] = useState("");
  const [projects, setProjects] = useState<ProjectRow[]>([]);
  const [handled, setHandled] = useState<string[]>([]);
  const [contact, setContact] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([api.projects.list(), api.serviceCenter.info()])
      .then(([projectResponse, serviceResponse]) => {
        setProjects(projectResponse.projects);
        setHandled(serviceResponse.handled);
        setContact(serviceResponse.contact);
      })
      .catch((requestError) => setError(requestError instanceof Error ? requestError.message : "Could not load the service center."));
  }, []);

  return (
    <div>
      <h1 className={`font-display text-[28px] font-semibold ${t.ink}`}>Service Center</h1>
      <p className={`mb-8 mt-1 text-[14px] ${t.muted}`}>
        Chat or open a ticket on any product. We handle vendors — you never get a third-party login.
      </p>
      <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <Card>
          {sent ? (
            <p className={t.ink}>Ticket received. We&apos;ll reply at {contact || "your account email"}.</p>
          ) : (
            <div className="space-y-4">
              <Field label="Project">
                <SelectInput value={project} onChange={(event) => setProject(event.target.value)}>
                  <option value="">Select a project…</option>
                  {projects.map((item) => (
                    <option key={item.id} value={item.id}>{item.name}</option>
                  ))}
                </SelectInput>
              </Field>
              <Field label="Subject"><TextInput placeholder="What&apos;s going on?" /></Field>
              <Field label="Message"><TextArea value={body} onChange={(event) => setBody(event.target.value)} /></Field>
              {error && <p className="text-[13px] text-[#8C2F1B]">{error}</p>}
              <PrimaryButton disabled={!project || body.trim().length < 8} onClick={() => setSent(true)}>
                Open ticket
              </PrimaryButton>
            </div>
          )}
        </Card>
        <Card>
          <p className={`font-semibold ${t.ink}`}>We handle</p>
          <ul className={`mt-3 space-y-2 text-[13px] ${t.muted}`}>
            {handled.map((item) => <li key={item}>• {item}</li>)}
          </ul>
          {contact && <p className={`mt-4 text-[12px] ${t.muted}`}>Contact: {contact}</p>}
        </Card>
      </div>
    </div>
  );
}
