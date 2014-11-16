/* global React */

var firebaseApp = "https://lecturegauge.firebaseio.com/";

var CommentFeedbackPage = React.createClass({
    handleClick: function(evt) {
        console.log("Updating commentType to", evt.target.value);
        this.setState({'commentType': evt.target.value});
    },

    handleSubmit: function(evt){
        evt.preventDefault();

        var comment = {
            'commentType': this.state.commentType,
            'text': $("textarea", evt.target).val(),
            'timestamp': moment().format()
        };

        this.props.handleCommentSubmit(comment);

        this.setState(this.getInitialState());
    },

    getInitialState: function() {
        return {
            'text': null,
            'commentType': null,
            'timestamp': null
        };
    },

    render: function() {
        var commentBox;
        if (this.state.commentType !== null) {
            commentBox = (
                <div className="row comment-row">
                    <div className="col-xs-12">
                        {this.state.commentType}

                        <form className="form-horizontal" role="form" onSubmit={this.handleSubmit}>
                            <textarea className="form-control" rows="3" placeholder="Enter a comment!"></textarea>
                            <button type="submit" className="btn btn-block btn-primary">Submit</button>
                        </form>
                    </div>
                </div>
            );
        }

        return (
        <div>
            <div className="row">
                <div className="col col-xs-4">
                    <button type="button" className="btn btn-block btn-success understand-button" onClick={this.handleClick} value="SUCCESS">
                        <span className="glyphicon glyphicon-ok-sign glyphiconDec" aria-hidden="true"></span>
                        <span className="sr-only">I understand.</span>
                    </button>
                </div>
                <div className="col col-xs-4">
                    <button type="button" className="btn btn-block btn-warning understand-button" onClick={this.handleClick} value="WARNING">
                        <span className="glyphicon glyphicon-minus-sign glyphiconDec" aria-hidden="true"></span>
                        <span className="sr-only">I sort of understand.</span>
                    </button>
                </div>
                <div className="col col-xs-4">
                    <button type="button" className="btn btn-block btn-danger understand-button" onClick={this.handleClick} value="FAILURE">
                        <span className="glyphicon glyphicon-remove-sign glyphiconDec" aria-hidden="true"></span>
                        <span className="sr-only">I don't understand.</span>
                    </button>
                </div>
            </div>
            {commentBox}
        </div>
        );
    }
});

var Comment = React.createClass({
    render: function() {
        var cx = React.addons.classSet;

        var classes = cx({
            "col": true,
            "col-xs-1": true,
            "green-block": this.props.commentType === 'SUCCESS',
            "yellow-block": this.props.commentType === 'WARNING',
            "red-block": this.props.commentType === 'FAILURE'
        });

        var srCommentText = cx({
            "I understand.": this.props.commentType === 'SUCCESS',
            "I'm a little confused.": this.props.commentType === 'WARNING',
            "I don't understand.": this.props.commentType === 'FAILURE'
        });

        return (
            <div className="row feedback-row">
                <div className={classes}>
                    <span className="sr-only">{srCommentText}</span>
                </div>
                <div className="col col-xs-9">
                    <p>{this.props.text}</p>
                    <p className="timestamp">{this.props.timestamp}</p>
                </div>
            </div>
        );
    }
});

var CommentBarGraph = React.createClass({
    chart: null,

    componentDidMount: function() {
        this.chart = new Highcharts.Chart({
            chart: {
                renderTo: 'comments-graph',
                type: 'column'
            },
            title: {
                text: "Amount of Students Commenting in 5 Minute Intervals"
            },
            xAxis: {
                categories: []
            },
            yAxis: {
                title: {
                    text: 'Comments'
                },
                stackLabels: {
                  enabled: true,
                    style: {
                      fontWeight: 'bold',
                      color: (Highcharts.theme && Highcharts.theme.textColor) || 'gray'
                  }
                },
            },
            plotOptions: {
                column: {
                  stacking: 'normal',
                  dataLabels: {
                    enabled: true,
                    color: (Highcharts.theme && Highcharts.theme.dataLabelsColor) || 'white',
                    style: {
                        textShadow: '0 0 3px black, 0 0 3px black'
                    }
                  }
                }
            },
            series: [{
                name: "Understand",
                data: []
            },
            {
                name: "Kind of Understand",
                data:[]
            },
            {
                name: "Don't Understand",
                data:[]
            }
            ]
        });
    },

    componentDidUpdate: function() {
        var lectureStart = moment("2014-11-16T08:00:00-05:00");
        var lectureEnd = moment("2014-11-16T09:30:00-05:00");

        var incrementsSinceStart = Math.floor(lectureEnd.diff(lectureStart, 'm') / 5);
        var successCount = {};
        var warningCount = {};
        var failureCount = {};
        for (var i = 0; i < incrementsSinceStart; i++) {
            successCount[i] = 0;
            warningCount[i] = 0;
            failureCount[i] = 0;
        }

        this.props.data.forEach(function(comment) {
            var time = moment(comment.timestamp);
            if (time.diff(lectureEnd) > 0) {
                // Someone commented after the lecture ended
                return;
            }

            var increment = Math.floor(time.diff(lectureStart, 'm') / 5);
            if (comment.commentType === 'SUCCESS') {
              successCount[increment]++;
            }else if(comment.commentType === 'WARNING') {
              warningCount[increment]++;
            }
            else {
              failureCount[increment]++;
            }
        });

        var successBlocks = [];
        for (var key in successCount) {
            if (successCount.hasOwnProperty(key)) {
                successBlocks.push({block: key, count: successCount[key]});
            }
        }
        var warningBlocks = [];
        for (var key in warningCount) {
            if (warningCount.hasOwnProperty(key)) {
                warningBlocks.push({block: key, count: warningCount[key]});
            }
        }
        var failureBlocks = [];
        for (var key in failureCount) {
            if (failureCount.hasOwnProperty(key)) {
                failureBlocks.push({block: key, count: failureCount[key]});
            }
        }

        successBlocks = successBlocks.sort(function(a, b) { return a - b; });

        var sortedSuccessBlocks = successBlocks.map(function(block) {
            return block.key;
        });

        var sortedSuccessBlockCount = successBlocks.map(function(block) {
            return block.count;
        });

        warningBlocks = warningBlocks.sort(function(a, b) { return a - b; });

        var sortedWarningBlocks = warningBlocks.map(function(block) {
            return block.key;
        });

        var sortedWarningBlockCount = warningBlocks.map(function(block) {
            return block.count;
        });

        failureBlocks = failureBlocks.sort(function(a, b) { return a - b; });

        var sortedFailureBlocks = failureBlocks.map(function(block) {
            return block.key;
        });

        var sortedFailureBlockCount = failureBlocks.map(function(block) {
            return block.count;
        });

        //incrementBlocks = incrementBlocks.sort(function(a, b) { return a - b; });

        //var sortedBlocks = incrementBlocks.map(function(block) {
            //return block.key;
        //});

        //var sortedBlockCount = incrementBlocks.map(function(block) {
            //return block.count;
        //});

        if (this.chart) {
            this.chart.xAxis[0].setCategories(sortedSuccessBlocks);
            this.chart.series[0].setData(sortedSuccessBlockCount);
            //this.chart.xAxis[1].setCategories(sortedWarningBlocks);
            this.chart.series[1].setData(sortedWarningBlockCount);
            //this.chart.xAxis[2].setCategories(sortedFailureBlocks);
            this.chart.series[2].setData(sortedFailureBlockCount);
          //  this.chart.xAxis[0].setCategories(sortedBlocks);
          //  this.chart.series[0].setData(sortedBlockCount);
        }
    },

    render: function() {
        return (
            <div id="comments-graph" style={{"width": "100%", "height": "200px"}}></div>
        );
    }
});

var CommentList = React.createClass({
    render: function() {
        var commentNodes = this.props.data.sort(function (a, b) {
            return moment(b.timestamp).unix() - moment(a.timestamp).unix();
        }).map(function(comment, index) {
            return <Comment key={index} commentType={comment.commentType} text={comment.text} timestamp={comment.timestamp} />
        });

        return (
        <div>
            {commentNodes}
        </div>
        );
    }
});

var App = React.createClass({
    mixins: [ReactFireMixin],

    handleCommentSubmit: function(comment) {
        var comments = this.state.data;
        comments.push(comment);
        this.setState(comments);

        this.firebaseRefs["data"].push(comment);
    },

    getInitialState: function() {
        return {'data': []};
    },

    componentWillMount: function() {
        this.bindAsArray(new Firebase(firebaseApp + "comments"), "data");
    },

    render: function() {
        return (
            <div className="container">
                <div className="row">
                    <div className="col col-xs-12 current-time">
                        <p className="text-center">11:23 a.m.</p>
                    </div>
                </div>

                <div className="row">
                    <div className="col col-xs-12">
                        <div className="progress">
                            <div className="progress-bar" role="progressbar" aria-valuenow="60" aria-valuemin="0" aria-valuemax="100" style={{"width": "60%"}}>
                                <span className="sr-only">60% Complete</span>
                            </div>
                        </div>
                    </div>
                </div>

                <CommentFeedbackPage handleCommentSubmit={this.handleCommentSubmit} />
                <CommentBarGraph data={this.state.data} />
                <CommentList data={this.state.data} />
            </div>
        );
    }
});

$(function() {
    React.render(
        <App />,
        document.getElementById('app')
    );
});
