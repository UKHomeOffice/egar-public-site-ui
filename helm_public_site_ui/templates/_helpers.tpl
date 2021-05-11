{{- define "publicsiteui.labels" -}}
name: {{ .Values.global.publicsiteui.appName }}-svc
service: {{ .Values.global.publicsiteui.appName }}-svc
{{- end -}}

#{{- define "publicsiteui.fedbsha" -}}
#dbcredshash: {{ printf "%s%s" .Values.global.appdbcreds.frontenDDBUser .Values.global.appdbcreds.frontenDDBPassword | sha256sum }}
#{{- end -}}


{{- define "publicsiteui.envData" -}}
{{- $envDict := merge .Values.global.publicsiteui.envData .Values.global.envDataGovNotify .Values.envData }}
{{- range $key, $value := $envDict }}
- name: {{ $key }}
  value: {{ $value | quote }}
{{- end }}
- name: API_BASE
  value: "https://{{ .Values.global.dataaccessapi.appName }}-svc.{{ .Release.Namespace }}.svc.cluster.local:{{ .Values.global.dataaccessapi.appPort }}"
- name: PUBLIC_SITE_DBUSER
  value: {{ .Values.global.appdbcreds.frontenDDBUser | quote }}
- name: PUBLIC_SITE_DBPASSWORD
  value: {{ .Values.global.appdbcreds.frontenDDBPassword | quote }}
{{- end -}}