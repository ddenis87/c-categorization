<template>
    <div class="wrapper">
        <h2><p>Welcome to this study. It will require less than 10 minutes of your time. We appreciate your participation.</p></h2>

        <c-categorization-mobile ref="cCategorizationMobile"></c-categorization-mobile>

        <div class="footer">
            <button class="btn btn-default">Previous</button>
            <button class="btn btn-default">Next</button>
        </div>
    </div>
</template>

<script>
export default {
    name: 'App',
    data() {
        return {
            options: [
                { id: 'option1', TEXT: 'Option 1', FANCY_TEXT: 'Fancy Option 1 <img src="https://i.postimg.cc/gk0ThdtM/terminator.jpg" />' },
                { id: 'option2', TEXT: 'Option 2', FANCY_TEXT: 'Fancy Option 2 <img src="https://i.postimg.cc/GpZh9MXc/long.jpg" />' },
                { id: 'option3', TEXT: 'Option 3' },
                { id: 'option4', TEXT: 'Option 4', FANCY_TEXT: 'Fancy Option 4' },
                { id: 'option5', TEXT: 'Option 5', FANCY_TEXT: 'Fancy Option 5' },
                { id: 'option5', TEXT: 'Option 5', FANCY_TEXT: 'Fancy Option 5' },
                { id: 'option5', TEXT: 'Option 5', FANCY_TEXT: 'Fancy Option 5' },
            ],
            categories: [
                { id: 'category1', TEXT: 'Category 1', FANCY_TEXT: 'Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old. Richard McClintock, a Latin professor at Hampden-Sydney College in Virginia, looked up one of the more obscure Latin words, consectetur, from a Lorem Ipsum passage, and going through the cites of the word in classical literature, discovered the undoubtable source. Lorem Ipsum comes from sections 1.10.32 and 1.10.33 of "de Finibus Bonorum et Malorum" (The Extremes of Good and Evil) by Cicero, written in 45 BC. This book is a treatise on the theory of ethics, very popular during the Renaissance. The first line of Lorem Ipsum, "Lorem ipsum dolor sit amet..", comes from a line in section 1.10.32.\n' +
                        '\n <img src="https://i.postimg.cc/gk0ThdtM/terminator.jpg" />' +
                        'The standard chunk of Lorem Ipsum used since the 1500s is reproduced below for those interested. Sections 1.10.32 and 1.10.33 from "de Finibus Bonorum et Malorum" by Cicero are also reproduced in their exact original form, accompanied by English versions from the 1914 translation by H. Rackham.'},
                { id: 'category2', TEXT: 'Category 2', FANCY_TEXT: 'Fancy Category 2' },
                { id: 'category3', TEXT: 'Category 3' },
                { id: 'category4', TEXT: 'Category 4' },
                { id: 'category5', TEXT: 'Category 5' },
                { id: 'category6', TEXT: 'Category 6' },
                { id: 'category6', TEXT: 'Category 6' },
                { id: 'category6', TEXT: 'Category 6' },
            ],
            cCategorizationMobile: null,
            from: 1,
            to: 2,
        };
    },

    mounted() {
        this.cCategorizationMobile = this.$refs.cCategorizationMobile;

        this.cCategorizationMobile.initialize(
            {
                'default': `Select from ${this.from} to ${this.to} option${this.to > 1 ? 's' : ''}`,
                'selected': 'Select category',
                'expanded': 'Viewing or extract options',
            },
            {
                title: 'Options',
                data: this.options,
            },
            {
                title: 'Categories',
                data: this.categories,
            },
            {
                from: this.from,
                to: this.to,
            }
        );
    },
}
</script>

<style>
    body {
        margin: 0;
        padding: 0;
    }

    .wrapper {
    }

    h2 {
        margin: 0;
    }

    p {
        border-bottom: thin solid grey;
        padding: 16px;
        margin: 0;
    }

    .footer {
        width: 100vw;
        background-color: white;
        border-top: thin solid grey;
        display: flex;
        justify-content: space-between;
        padding: 8px 16px;
        box-sizing: border-box;
        gap: 20px;
        height: 52px;
    }

    .btn {
        display: inline-block;
        padding: 6px 12px;
        margin-bottom: 0;
        font-size: 14px;
        font-weight: 400;
        line-height: 1.42857143;
        text-align: center;
        white-space: nowrap;
        vertical-align: middle;
        -ms-touch-action: manipulation;
        touch-action: manipulation;
        cursor: pointer;
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
        background-image: none;
        border: 1px solid transparent;
        border-radius: 4px;
        width: 100%;
    }

    .btn-default {
        color: #333;
        background-color: #fff;
        border-color: #ccc;
    }

    /* .c-categorization-mobile style rule set outside */
    c-categorization-mobile {
        display: block;
        width: 100vw;
        height: calc(100vh - 52px);
        overflow: hidden;
    }
</style>
