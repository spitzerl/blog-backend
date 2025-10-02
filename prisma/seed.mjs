// prisma/seed.mjs
import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@example.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'changeme';

async function main() {
  console.log('Running seed script...');

  // Create roles
  const roles = ['admin', 'user'];
  for (const name of roles) {
    await prisma.role.upsert({
      where: { name },
      update: {},
      create: { name },
    });
    console.log(`Role ensured: ${name}`);
  }

  // Hash password
  const hashed = await bcrypt.hash(ADMIN_PASSWORD, 10);

  // Create or update admin user
  const admin = await prisma.user.upsert({
    where: { email: ADMIN_EMAIL },
    update: {
      password: hashed,
      role: { connect: { name: 'admin' } },
    },
    create: {
      email: ADMIN_EMAIL,
      password: hashed,
      role: { connect: { name: 'admin' } },
    },
  });

  console.log('Admin user upserted:', admin.email);

  // Create sample posts with Markdown content
  const samplePosts = [
    {
      title: "Bienvenue sur mon blog",
      excerpt: "Premier article de bienvenue avec du contenu Markdown",
      coverImage: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800&h=400&fit=crop",
      content: `# Bienvenue sur mon blog !

![Image de bienvenue](https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=600&h=300&fit=crop)

Ceci est mon **premier article** sur ce blog. Voici ce que vous pouvez attendre :

## Fonctionnalités

- Support complet du **Markdown**
- Images de bannière pour chaque article
- *Formatage riche* du texte
- Liens vers [des ressources externes](https://example.com)

## Code

Vous pouvez même inclure du code :

\`\`\`javascript
const salutation = "Bonjour le monde !";
console.log(salutation);
\`\`\`

> Cette citation montre que les blockquotes fonctionnent aussi !

### Liste des prochains articles

1. Guide Markdown avancé
2. Gestion des images
3. Optimisation SEO

---

Merci de votre visite ! 🚀`,
      authorId: admin.id
    },
    {
      title: "Guide du Markdown",
      excerpt: "Apprenez tous les secrets du formatage Markdown",
      coverImage: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=400&fit=crop",
      content: `# Guide complet du Markdown

Le **Markdown** est un langage de balisage léger qui vous permet de formater du texte facilement.

## Syntaxe de base

### Texte
- **Gras** : \`**texte**\`
- *Italique* : \`*texte*\`
- ~~Barré~~ : \`~~texte~~\`

### Images
Pour ajouter une image :
\`\`\`markdown
![Texte alternatif](https://example.com/image.jpg)
\`\`\`

![Exemple d'image](https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&h=250&fit=crop)

### Listes

#### Liste à puces
- Premier élément
- Deuxième élément
  - Sous-élément

#### Liste numérotée
1. Premier point
2. Deuxième point
3. Troisième point

### Code

Inline : \`const variable = "valeur";\`

Bloc de code :
\`\`\`python
def hello_world():
    print("Hello, World!")
\`\`\`

> **Tip** : Le Markdown rend l'écriture web beaucoup plus rapide !`,
      authorId: admin.id
    }
  ];

  // Clear existing posts and recreate them
  await prisma.post.deleteMany({});
  console.log('Cleared existing posts');

  // Insert sample posts
  for (const postData of samplePosts) {
    const post = await prisma.post.create({
      data: postData,
    });
    console.log(`Post created: ${post.title}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

