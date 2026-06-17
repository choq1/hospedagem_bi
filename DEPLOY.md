# 🚀 Guia de Deploy - Projeto BI no Render

## 📋 Pré-requisitos

- ✅ Conta no GitHub
- ✅ Conta no Render (https://render.com)
- ✅ Supabase já configurado

---

## 🎯 PASSO 1: Push do Código para GitHub

### 1.1 Crie um repositório no GitHub

1. Vá para https://github.com/new
2. **Nome do repositório:** `projeto-bi` (ou seu nome preferido)
3. Deixe como **Public** (mais fácil)
4. Clique em **"Create repository"**

### 1.2 Faça push do código

```bash
# No seu terminal, na pasta do projeto:
git init
git add .
git commit -m "Migração de SQLite para Supabase - versão para deploy"
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/projeto-bi.git
git push -u origin main
```

⚠️ **Substituir `SEU_USUARIO` pelo seu username do GitHub**

---

## 🎯 PASSO 2: Conectar ao Render

### 2.1 Acesse Render

1. Vá para https://dashboard.render.com/
2. Faça login com GitHub (mais fácil)
3. Clique em **"New +"** → **"Web Service"**

### 2.2 Conecte seu repositório

1. Procure por **`projeto-bi`** (seu repositório)
2. Clique em **"Connect"**

### 2.3 Configure o deployment

- **Name:** `projeto-bi`
- **Environment:** `Node`
- **Region:** Escolha a mais próxima (ex: São Paulo)
- **Build Command:** `npm install`
- **Start Command:** `npm start`
- **Plan:** Free (suficiente para testes)

**Clique em "Create Web Service"**

---

## 🎯 PASSO 3: Adicionar Variáveis de Ambiente

Após criar o serviço, vá para a aba **"Environment"** e adicione:

| Variável | Valor |
|----------|-------|
| `NODE_ENV` | `production` |
| `PORT` | `3000` |
| `SUPABASE_URL` | `https://yarnlzndkgifflcoznnx.supabase.co` |
| `SUPABASE_ANON_KEY` | `sb_publishable_fIBEF78S1PocREIw0LDQbw_5ZEOfagS` |
| `JWT_SECRET` | `452798cfce9f112dad5442287a193a9ec715177c71d461b11651fa19429d3b52` |
| `CLIENT_ID` | *(seu Client ID do Power BI)* |
| `CLIENT_SECRET` | *(seu Client Secret do Power BI)* |
| `TENANT_ID` | *(seu Tenant ID do Power BI)* |
| `WORKSPACE_ID` | *(seu Workspace ID do Power BI)* |

**Clique em "Save"** após adicionar as variáveis.

---

## 🎯 PASSO 4: Aguardar Build e Deploy

1. Render vai fazer o **build** automaticamente
2. Você vai ver um log em tempo real
3. Quando terminar, clique em **"Live"**
4. Seu app estará rodando em algo como: `https://projeto-bi.onrender.com`

---

## ✅ Testar se Funcionou

### Testar login:

```bash
curl -X POST https://projeto-bi.onrender.com/api/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@caminho.com.br",
    "senha": "admin5583"
  }'
```

Deve retornar um **token JWT** se funcionou! ✅

---

## 🌐 PASSO 5: Configurar Domínio Próprio (Opcional)

Se quiser usar seu próprio domínio (ex: `minhaempresa.com.br`):

1. No Render, vá para **"Settings"** → **"Custom Domain"**
2. Digite seu domínio
3. Render vai gerar um **CNAME**
4. Adicione o CNAME no seu provedor de domínio
5. Aguarde a propagação (pode levar 24h)

---

## 🐛 Troubleshooting

### Build falhou?
- Verifique se todas as variáveis de ambiente estão definidas
- Verifique o log de build no Render
- Se der erro de módulos, tente: `npm install` localmente e veja se há erro

### Aplicação crasheia?
- Verifique o log no Render (aba "Logs")
- Confira se `SUPABASE_URL` e `SUPABASE_ANON_KEY` estão corretos
- Teste localmente com `npm start`

### Erro de autenticação?
- Confirme que o JWT_SECRET está correto
- Confirme que os usuários existem no Supabase

---

## 📞 Próximas Etapas

Após o deploy funcionar:

1. ✅ Testar todas as rotas de autenticação
2. ✅ Testar integração com Power BI
3. ✅ Adicionar mais usuários conforme necessário
4. ✅ Configurar backup automático no Supabase
5. ✅ Monitorar logs no Render

---

**Sucesso! 🎉 Seu projeto está pronto para produção!**
