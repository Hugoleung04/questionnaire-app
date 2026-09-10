window.QUESTIONNAIRE = {
  title: "我們現在怎麼感受愛",
  subtitle: "先寫現在的答案，不要偷看上次答案再照抄。",
  sections: [
    {
      id: "daily",
      title: "最近的日常",
      hint: "慢慢答就得，唔使一次過寫完。",
      questions: [
        { id: 1, type: "text", required: true, label: "最近最喜歡吃的東西是什麼？" },
        { id: 2, type: "text", required: true, label: "最近突然開始喜歡什麼以前不喜歡的東西？" },
        { id: 3, type: "text", required: true, label: "最近有沒有什麼以前很喜歡，現在卻還好的東西？" },
        { id: 4, type: "text", required: true, label: "最近最常聽的一首歌？" },
        { id: 5, type: "text", required: true, label: "如果突然多出完整的一天，你現在最想拿來做什麼？" },
        { id: 6, type: "text", required: true, label: "最近最想去的地方是哪裡？" },
        { id: 7, type: "text", required: true, label: "最期待的一件小事？" },
        { id: 8, type: "text", required: true, label: "最近有沒有一件事，是你嘴上說沒差，其實有點在意的？" },
        { id: 9, type: "text", required: true, label: "最近讓你最累的是什麼？" },
        { id: 10, type: "text", required: true, label: "最近有哪件事，讓你覺得自己其實做得不錯？" },
        { id: 11, type: "text", required: true, label: "最近最不喜歡別人對你說哪句話？" }
      ]
    },
    {
      id: "together",
      title: "心情同相處",
      hint: "呢部分同「我」點陪你有關。",
      questions: [
        {
          id: 12,
          type: "checkbox",
          required: true,
          label: "現在心情不好的時候，你希望我怎麼陪你？",
          options: [
            "抱抱你",
            "陪你講講話",
            "安靜陪在你身邊",
            "先讓你一個人",
            "帶你走走散心",
            "給你吃東西"
          ],
          allowOther: true
        },
        { id: 13, type: "text", required: true, label: "當你說「沒事」時，現在的你通常是真的沒事嗎？" },
        { id: 14, type: "text", required: true, label: "最近有沒有什麼事情，你希望我少問一點？" },
        { id: 15, type: "text", required: true, label: "最近有沒有什麼事情，你反而希望我多問你一點？" }
      ]
    },
    {
      id: "us",
      title: "我們之間",
      hint: "講最近嘅相處、喜歡同習慣。",
      questions: [
        { id: 16, type: "text", required: true, label: "最近哪個瞬間，讓你覺得「還好身邊是『我』這個人」？" },
        { id: 17, type: "text", required: true, label: "最近我做了哪件小事，其實你很喜歡，卻一直沒說？" },
        { id: 18, type: "text", required: true, label: "現在的你，最喜歡我哪一點？" },
        { id: 19, type: "text", required: true, label: "以前很喜歡我的哪個地方，現在已經沒那麼重要了？" },
        { id: 20, type: "text", required: true, label: "最近有沒有哪件事，我以為你喜歡，其實你已經不喜歡了？" },
        { id: 21, type: "text", required: true, label: "最近的相處裡，有沒有哪件事讓你覺得有點委屈？" },
        { id: 22, type: "text", required: true, label: "有沒有一件事情，你希望我們以後可以少一點？" },
        { id: 23, type: "text", required: true, label: "有沒有一件事情，你希望我們以後可以多一點？" },
        { id: 24, type: "text", required: true, label: "如果最近的我們只能改掉一個壞習慣，你會選什麼？" }
      ]
    },
    {
      id: "love",
      title: "我們現在怎麼感受愛",
      hint: "先寫現在的答案，不要偷看上次答案再照抄。",
      questions: [
        { id: 25, type: "text", required: true, label: "現在的你，覺得「被愛」最像什麼？" },
        { id: 26, type: "text", required: true, label: "現在的你，需要安全感的方式，跟以前一樣嗎？" },
        { id: 27, type: "text", required: true, label: "最近有沒有一句很想跟我說，卻一直覺得沒必要特別講的話？" }
      ]
    },
    {
      id: "last",
      title: "最後三題",
      hint: "先寫現在的答案，不要偷看上次答案再照抄。",
      questions: [
        { id: 28, type: "text", required: true, label: "如果今天是第一次認識，你覺得現在的我還會吸引你嗎？為什麼？" },
        { id: 29, type: "text", required: true, label: "如果重新跟「現在的我」談一次戀愛，你希望自己做的哪裡不一樣？" },
        { id: 30, type: "text", required: true, label: "你覺得，最近的你，變成什麼樣子了？" }
      ]
    }
  ]
};
