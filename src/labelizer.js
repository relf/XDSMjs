function Labelizer() {}

Labelizer.strParse = function(str) {
  if (str === "") {
    return [{base: '', sub: undefined, sup: undefined}];
  }

  var lstr = str.split(',');
  var underscores = /_/g;
  var rg = /([0-9\-]+:)?([A-Za-z0-9\-\.]+)(_[A-Za-z0-9\-\._]+)?(\^.+)?/;

  var res = lstr.map(function(s) {
    var base;
    var sub;
    var sup;

    if ((s.match(underscores) || []).length > 1) {
      var mu = s.match(/(.+)\^(.+)/);
      if (mu) {
        return {base: mu[1], sub: undefined, sup: mu[2]};
      }
      return {base: s, sub: undefined, sup: undefined};
    }
    var m = s.match(rg);
    if (m) {
      base = (m[1] ? m[1] : "") + m[2];
      if (m[3]) {
        sub = m[3].substring(1);
      }
      if (m[4]) {
        sup = m[4].substring(1);
      }
    } else {
      throw new Error("Labelizer.strParse: Can not parse '" + s + "'");
    }
    return {base: base, sub: sub, sup: sup};
  }, this);

  return res;
};

Labelizer.labelize = function() {
  var ellipsis = 0;

  function createLabel(selection) {
    selection.each(function(d) {
      var tokens = Labelizer.strParse(d.name);
      var text = selection.append("text");
      tokens.every(function(token, i, ary) {
        var offsetSub = 0;
        var offsetSup = 0;
        if (ellipsis < 1 || (i < 5 && text.nodes()[0].getBBox().width < 100)) {
          text.append("tspan").text(token.base);
          if (token.sub) {
            offsetSub = 10;
            text.append("tspan")
              .attr("class", "sub")
              .attr("dy", offsetSub)
              .text(token.sub);
          }
          if (token.sup) {
            offsetSup = -10;
            text.append("tspan")
              .attr("class", "sup")
              .attr("dx", -5)
              .attr("dy", -offsetSub + offsetSup)
              .text(token.sup);
            offsetSub = 0;
          }
        } else {
          text.append("tspan")
            .attr("dy", -offsetSub - offsetSup)
            .text("...");
          selection.classed("ellipsized", true);
          return false;
        }
        if (i < ary.length - 1) {
          text.append("tspan")
            .attr("dy", -offsetSub - offsetSup)
            .text(", ");
        }
        return true;
      }, this);
    });
  }

  createLabel.ellipsis = function(value) {
    if (!arguments.length) {
      return ellipsis;
    }
    ellipsis = value;
    return createLabel;
  };

  return createLabel;
};

Labelizer.tooltipize = function() {
  var text = "";

  function createTooltip(selection) {
    var tokens = Labelizer.strParse(text);
    var html = [];
    tokens.forEach(function(token) {
      var item = token.base;
      if (token.sub) {
        item += "<sub>" + token.sub + "</sub>";
      }
      if (token.sup) {
        item += "<sup>" + token.sup + "</sup>";
      }
      html.push(item);
    }, this);
    selection.html(html.join(", "));
  }

  createTooltip.text = function(value) {
    if (!arguments.length) {
      return text;
    }
    text = value;
    return createTooltip;
  };

  return createTooltip;
};

module.exports = Labelizer;
