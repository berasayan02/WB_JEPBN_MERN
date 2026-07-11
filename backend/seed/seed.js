// Populates MongoDB with all subjects and questions converted from the
// original static site. Run with: npm run seed
require("dotenv").config();
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const Subject = require("../models/Subject");
const Question = require("../models/Question");

const DATA_DIR = path.join(__dirname, "data");

const run = async () => {
  await connectDB();

  const manifest = JSON.parse(fs.readFileSync(path.join(DATA_DIR, "_manifest.json"), "utf8"));

  console.log(`Seeding ${manifest.length} subjects...`);

  for (const entry of manifest) {
    const questionsPath = path.join(DATA_DIR, `${entry.slug}.json`);
    const questions = JSON.parse(fs.readFileSync(questionsPath, "utf8"));

    let subject = await Subject.findOne({ slug: entry.slug });
    if (subject) {
      subject.set({
        name: entry.name,
        category: entry.category,
        questionsPerTest: entry.questionsPerTest,
        timeLimitMinutes: entry.timeLimitMinutes,
        negativeMarking: entry.negativeMarking,
      });
      await subject.save();
      // Replace existing questions for this subject to avoid duplicates on re-seed
      await Question.deleteMany({ subject: subject._id });
    } else {
      subject = await Subject.create({
        slug: entry.slug,
        name: entry.name,
        category: entry.category,
        questionsPerTest: entry.questionsPerTest,
        timeLimitMinutes: entry.timeLimitMinutes,
        negativeMarking: entry.negativeMarking,
      });
    }

    const docs = questions.map((q) => ({
      subject: subject._id,
      text: q.text,
      options: q.options,
      correctIndex: q.correctIndex,
    }));

    await Question.insertMany(docs);
    console.log(`  ${entry.slug}: ${docs.length} questions loaded`);
  }

  console.log("Seeding complete.");
  await mongoose.connection.close();
  process.exit(0);
};

run().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
